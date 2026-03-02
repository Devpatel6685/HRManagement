using HRManagement.Application.DTOs.Payroll;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using iText.IO.Font.Constants;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Borders;
using PdfLayoutDocument = iText.Layout.Document;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.EntityFrameworkCore;
using PdfDocument = iText.Kernel.Pdf.PdfDocument;

namespace HRManagement.Application.Services;

public class PayrollService : IPayrollService
{
    private readonly IApplicationDbContext _context;

    public PayrollService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GeneratePayrollResultDto> GeneratePayrollAsync(
        GeneratePayrollDto dto, CancellationToken cancellationToken = default)
    {
        var result = new GeneratePayrollResultDto();

        foreach (var input in dto.Employees)
        {
            try
            {
                var exists = await _context.Payrolls.AnyAsync(
                    p => p.EmployeeId == input.EmployeeId && p.Month == dto.Month && p.Year == dto.Year,
                    cancellationToken);

                if (exists) { result.Skipped++; continue; }

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == input.EmployeeId, cancellationToken);

                if (employee is null)
                {
                    result.Errors.Add($"Employee {input.EmployeeId} not found.");
                    continue;
                }

                var payroll = new Payroll
                {
                    EmployeeId  = input.EmployeeId,
                    Month       = dto.Month,
                    Year        = dto.Year,
                    BasicSalary = input.BasicSalary,
                    HRA         = input.HRA,
                    Allowances  = input.Allowances,
                    Deductions  = input.Deductions,
                    NetSalary   = input.BasicSalary + input.HRA + input.Allowances - input.Deductions,
                    Status      = PayrollStatus.Generated,
                };

                _context.Payrolls.Add(payroll);
                result.Generated++;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Employee {input.EmployeeId}: {ex.Message}");
            }
        }

        if (result.Generated > 0)
            await _context.SaveChangesAsync(cancellationToken);

        return result;
    }

    public async Task<IReadOnlyList<PayrollDto>> GetPayrollHistoryAsync(
        Guid employeeId, CancellationToken cancellationToken = default)
    {
        var list = await _context.Payrolls
            .Include(p => p.Employee).ThenInclude(e => e.Department)
            .Include(p => p.Employee).ThenInclude(e => e.Designation)
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ToListAsync(cancellationToken);

        return list.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<PayrollDto>> GetAllPayrollAsync(
        CancellationToken cancellationToken = default)
    {
        var list = await _context.Payrolls
            .Include(p => p.Employee).ThenInclude(e => e.Department)
            .Include(p => p.Employee).ThenInclude(e => e.Designation)
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month)
            .ThenBy(p => p.Employee.LastName)
            .ToListAsync(cancellationToken);

        return list.Select(MapToDto).ToList();
    }

    public async Task<PayrollDto> MarkAsPaidAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var payroll = await _context.Payrolls
            .Include(p => p.Employee).ThenInclude(e => e.Department)
            .Include(p => p.Employee).ThenInclude(e => e.Designation)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Payroll record '{id}' not found.");

        if (payroll.Status == PayrollStatus.Paid)
            throw new InvalidOperationException("Payroll has already been marked as paid.");

        payroll.Status = PayrollStatus.Paid;
        payroll.PaidOn = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(payroll);
    }

    public async Task<byte[]> GeneratePdfPayslipAsync(Guid payrollId, CancellationToken cancellationToken = default)
    {
        var payroll = await _context.Payrolls
            .Include(p => p.Employee).ThenInclude(e => e.Department)
            .Include(p => p.Employee).ThenInclude(e => e.Designation)
            .FirstOrDefaultAsync(p => p.Id == payrollId, cancellationToken)
            ?? throw new KeyNotFoundException($"Payroll record '{payrollId}' not found.");

        return BuildPdf(payroll);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private static PayrollDto MapToDto(Payroll p) => new()
    {
        Id           = p.Id,
        EmployeeId   = p.EmployeeId,
        EmployeeName = $"{p.Employee.FirstName} {p.Employee.LastName}",
        EmployeeCode = p.Employee.EmployeeCode,
        Department   = p.Employee.Department?.Name ?? string.Empty,
        Designation  = p.Employee.Designation?.Title ?? string.Empty,
        Month        = p.Month,
        Year         = p.Year,
        BasicSalary  = p.BasicSalary,
        HRA          = p.HRA,
        Allowances   = p.Allowances,
        Deductions   = p.Deductions,
        NetSalary    = p.NetSalary,
        Status       = p.Status.ToString(),
        PaidOn       = p.PaidOn,
        GeneratedOn  = p.CreatedAt,
    };

    private static byte[] BuildPdf(Payroll p)
    {
        var regular = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
        var bold    = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

        using var ms     = new MemoryStream();
        using var writer = new PdfWriter(ms);
        using var pdf    = new PdfDocument(writer);
        var doc = new PdfLayoutDocument(pdf);
        doc.SetMargins(0, 0, 30, 0);

        var monthName = new DateTime(p.Year, p.Month, 1).ToString("MMMM yyyy");
        var empName   = $"{p.Employee.FirstName} {p.Employee.LastName}";
        var dept      = p.Employee.Department?.Name  ?? "—";
        var desig     = p.Employee.Designation?.Title ?? "—";

        // ── Gray palette ─────────────────────────────────────────────────
        var gray900 = new DeviceRgb(17,  24,  39);   // header bg
        var gray700 = new DeviceRgb(55,  65,  81);   // section heading text
        var gray500 = new DeviceRgb(107, 114, 128);  // label text
        var gray300 = new DeviceRgb(209, 213, 219);  // border / divider
        var gray200 = new DeviceRgb(229, 231, 235);  // table row alt bg
        var gray100 = new DeviceRgb(243, 244, 246);  // light section bg
        var gray50  = new DeviceRgb(249, 250, 251);  // near-white bg
        var white   = ColorConstants.WHITE;

        // ═══════════════════════════════════════════════════════════════
        // HEADER  (dark charcoal, two-column: company | payslip label)
        // ═══════════════════════════════════════════════════════════════
        var header = new Table(new float[] { 3, 2 }).UseAllAvailableWidth()
            .SetMarginBottom(0);
        header.AddCell(new Cell()
            .SetBackgroundColor(gray900).SetBorder(Border.NO_BORDER)
            .SetPaddingLeft(28).SetPaddingTop(22).SetPaddingBottom(22)
            .Add(new Paragraph("HR Management").SetFont(bold).SetFontSize(17).SetFontColor(white))
            .Add(new Paragraph("Human Resource Management System")
                .SetFont(regular).SetFontSize(8).SetFontColor(gray300).SetMarginTop(2)));
        header.AddCell(new Cell()
            .SetBackgroundColor(gray700).SetBorder(Border.NO_BORDER)
            .SetPaddingRight(24).SetPaddingTop(22).SetPaddingBottom(22)
            .SetTextAlignment(TextAlignment.RIGHT)
            .Add(new Paragraph("PAYSLIP").SetFont(bold).SetFontSize(20).SetFontColor(white))
            .Add(new Paragraph(monthName).SetFont(regular).SetFontSize(9).SetFontColor(gray300).SetMarginTop(2)));
        doc.Add(header);

        // thin accent line
        var accent = new Table(1).UseAllAvailableWidth();
        accent.AddCell(new Cell().SetBackgroundColor(gray300)
            .SetBorder(Border.NO_BORDER).SetHeight(2).SetPadding(0));
        doc.Add(accent);

        // ═══════════════════════════════════════════════════════════════
        // EMPLOYEE INFO  (4-column grid: label+value pairs)
        // ═══════════════════════════════════════════════════════════════
        doc.Add(new Paragraph(" ").SetFontSize(6));
        var infoOuter = new Table(new float[] { 1, 1, 1, 1 }).UseAllAvailableWidth();

        void AddInfo(string lbl, string val)
        {
            infoOuter.AddCell(new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetBorderRight(new SolidBorder(gray200, 1))
                .SetPaddingLeft(16).SetPaddingRight(16).SetPaddingTop(10).SetPaddingBottom(10)
                .Add(new Paragraph(lbl).SetFont(regular).SetFontSize(7.5f).SetFontColor(gray500))
                .Add(new Paragraph(val).SetFont(bold).SetFontSize(9.5f).SetFontColor(gray700).SetMarginTop(2)));
        }

        AddInfo("Employee Name",  empName);
        AddInfo("Employee Code",  p.Employee.EmployeeCode);
        AddInfo("Department",     dept);
        AddInfo("Designation",    desig);
        doc.Add(infoOuter);

        // divider
        var divider = new Table(1).UseAllAvailableWidth();
        divider.AddCell(new Cell().SetBackgroundColor(gray200)
            .SetBorder(Border.NO_BORDER).SetHeight(1).SetPadding(0));
        doc.Add(divider);
        doc.Add(new Paragraph(" ").SetFontSize(8));

        // ═══════════════════════════════════════════════════════════════
        // EARNINGS  |  DEDUCTIONS  (side by side)
        // ═══════════════════════════════════════════════════════════════
        var twoCol = new Table(new float[] { 1, 1 }).UseAllAvailableWidth()
            .SetMarginLeft(16).SetMarginRight(16);

        // ── Earnings ────────────────────────────────────────────────────
        var earn = new Cell().SetBorder(Border.NO_BORDER).SetPaddingRight(12);
        earn.Add(new Paragraph("EARNINGS")
            .SetFont(bold).SetFontSize(8).SetFontColor(gray500)
            .SetMarginBottom(4));

        var earnTable = new Table(new float[] { 3, 2 }).UseAllAvailableWidth();
        // header row
        earnTable.AddCell(HdrCell("Component", bold, gray900));
        earnTable.AddCell(HdrCell("Amount (Rs.)", bold, gray900, TextAlignment.RIGHT));
        // rows
        earnTable.AddCell(DataCell("Basic Salary", regular, gray700, gray50));
        earnTable.AddCell(AmtCell(p.BasicSalary, regular, gray700, gray50));
        earnTable.AddCell(DataCell("HRA", regular, gray700, ColorConstants.WHITE));
        earnTable.AddCell(AmtCell(p.HRA, regular, gray700, ColorConstants.WHITE));
        earnTable.AddCell(DataCell("Allowances", regular, gray700, gray50));
        earnTable.AddCell(AmtCell(p.Allowances, regular, gray700, gray50));
        // total
        var totalEarn = p.BasicSalary + p.HRA + p.Allowances;
        earnTable.AddCell(TotCell("Total Earnings", bold, gray100));
        earnTable.AddCell(TotAmtCell(totalEarn, bold, gray100));
        earn.Add(earnTable);
        twoCol.AddCell(earn);

        // ── Deductions ──────────────────────────────────────────────────
        var ded = new Cell().SetBorder(Border.NO_BORDER).SetPaddingLeft(12)
            .SetBorderLeft(new SolidBorder(gray200, 1));
        ded.Add(new Paragraph("DEDUCTIONS")
            .SetFont(bold).SetFontSize(8).SetFontColor(gray500)
            .SetMarginBottom(4));

        var dedTable = new Table(new float[] { 3, 2 }).UseAllAvailableWidth();
        dedTable.AddCell(HdrCell("Component", bold, gray900));
        dedTable.AddCell(HdrCell("Amount (Rs.)", bold, gray900, TextAlignment.RIGHT));
        dedTable.AddCell(DataCell("Total Deductions", regular, gray700, gray50));
        dedTable.AddCell(AmtCell(p.Deductions, regular, gray700, gray50));
        dedTable.AddCell(TotCell("Net Deductions", bold, gray100));
        dedTable.AddCell(TotAmtCell(p.Deductions, bold, gray100));
        ded.Add(dedTable);
        twoCol.AddCell(ded);

        doc.Add(twoCol);
        doc.Add(new Paragraph(" ").SetFontSize(10));

        // ═══════════════════════════════════════════════════════════════
        // NET SALARY BAR
        // ═══════════════════════════════════════════════════════════════
        var netBar = new Table(new float[] { 1, 1 }).UseAllAvailableWidth()
            .SetMarginLeft(16).SetMarginRight(16);
        netBar.AddCell(new Cell()
            .SetBackgroundColor(gray900).SetBorder(Border.NO_BORDER)
            .SetPaddingLeft(16).SetPaddingTop(14).SetPaddingBottom(14)
            .Add(new Paragraph("NET SALARY PAYABLE")
                .SetFont(bold).SetFontSize(9).SetFontColor(gray300)));
        netBar.AddCell(new Cell()
            .SetBackgroundColor(gray900).SetBorder(Border.NO_BORDER)
            .SetPaddingRight(16).SetPaddingTop(14).SetPaddingBottom(14)
            .SetTextAlignment(TextAlignment.RIGHT)
            .Add(new Paragraph($"Rs. {p.NetSalary:N2}")
                .SetFont(bold).SetFontSize(16).SetFontColor(white)));
        doc.Add(netBar);
        doc.Add(new Paragraph(" ").SetFontSize(8));

        // ═══════════════════════════════════════════════════════════════
        // STATUS + FOOTER
        // ═══════════════════════════════════════════════════════════════
        var footer = new Table(new float[] { 1, 1 }).UseAllAvailableWidth()
            .SetMarginLeft(16).SetMarginRight(16);
        var statusText = p.Status == PayrollStatus.Paid
            ? $"PAID  —  {p.PaidOn?.ToString("dd MMM yyyy")}"
            : "PENDING PAYMENT";
        footer.AddCell(new Cell().SetBorder(Border.NO_BORDER).SetPaddingTop(6)
            .Add(new Paragraph(statusText)
                .SetFont(bold).SetFontSize(8).SetFontColor(gray500)));
        footer.AddCell(new Cell().SetBorder(Border.NO_BORDER).SetPaddingTop(6)
            .SetTextAlignment(TextAlignment.RIGHT)
            .Add(new Paragraph($"Generated: {DateTime.Now:dd MMM yyyy  HH:mm}")
                .SetFont(regular).SetFontSize(7.5f).SetFontColor(gray500)));
        doc.Add(footer);

        doc.Close();
        return ms.ToArray();
    }

    // ── Cell factory methods ─────────────────────────────────────────────

    private static Cell HdrCell(string text, PdfFont bold, DeviceRgb bg,
        TextAlignment align = TextAlignment.LEFT) =>
        new Cell().SetBackgroundColor(bg).SetBorder(Border.NO_BORDER)
            .SetPaddingLeft(8).SetPaddingRight(8).SetPaddingTop(6).SetPaddingBottom(6)
            .SetTextAlignment(align)
            .Add(new Paragraph(text).SetFont(bold).SetFontSize(8)
                .SetFontColor(ColorConstants.WHITE));

    private static Cell DataCell(string text, PdfFont font, DeviceRgb fg, Color bg) =>
        new Cell().SetBackgroundColor(bg).SetBorder(Border.NO_BORDER)
            .SetPaddingLeft(8).SetPaddingRight(8).SetPaddingTop(5).SetPaddingBottom(5)
            .Add(new Paragraph(text).SetFont(font).SetFontSize(9).SetFontColor(fg));

    private static Cell AmtCell(decimal amount, PdfFont font, DeviceRgb fg, Color bg) =>
        new Cell().SetBackgroundColor(bg).SetBorder(Border.NO_BORDER)
            .SetPaddingLeft(8).SetPaddingRight(8).SetPaddingTop(5).SetPaddingBottom(5)
            .SetTextAlignment(TextAlignment.RIGHT)
            .Add(new Paragraph($"Rs. {amount:N2}").SetFont(font).SetFontSize(9).SetFontColor(fg));

    private static Cell TotCell(string text, PdfFont bold, DeviceRgb bg) =>
        new Cell().SetBackgroundColor(bg).SetBorder(Border.NO_BORDER)
            .SetBorderTop(new SolidBorder(new DeviceRgb(209, 213, 219), 1))
            .SetPaddingLeft(8).SetPaddingRight(8).SetPaddingTop(6).SetPaddingBottom(6)
            .Add(new Paragraph(text).SetFont(bold).SetFontSize(9)
                .SetFontColor(new DeviceRgb(17, 24, 39)));

    private static Cell TotAmtCell(decimal amount, PdfFont bold, DeviceRgb bg) =>
        new Cell().SetBackgroundColor(bg).SetBorder(Border.NO_BORDER)
            .SetBorderTop(new SolidBorder(new DeviceRgb(209, 213, 219), 1))
            .SetPaddingLeft(8).SetPaddingRight(8).SetPaddingTop(6).SetPaddingBottom(6)
            .SetTextAlignment(TextAlignment.RIGHT)
            .Add(new Paragraph($"Rs. {amount:N2}").SetFont(bold).SetFontSize(9)
                .SetFontColor(new DeviceRgb(17, 24, 39)));
}
