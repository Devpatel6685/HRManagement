using HRManagement.Application.DTOs.Attendance;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using HRManagement.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IApplicationDbContext _context;

    public AttendanceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AttendanceDto> CheckInAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with id '{employeeId}' was not found.");

        var today = DateOnly.FromDateTime(DateTime.Now);

        var existing = await _context.Attendances
            .Include(a => a.Breaks)
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == today, cancellationToken);

        if (existing?.CheckIn is not null)
            throw new DuplicateCheckInException("Employee has already checked in today.");

        var checkInTime = TimeOnly.FromDateTime(DateTime.Now);
        var status = checkInTime > new TimeOnly(9, 30)
            ? AttendanceStatus.Late
            : AttendanceStatus.Present;

        Attendance attendance;
        if (existing is null)
        {
            attendance = new Attendance
            {
                EmployeeId = employeeId,
                Date       = today,
                CheckIn    = checkInTime,
                Status     = status,
            };
            _context.Attendances.Add(attendance);
        }
        else
        {
            existing.CheckIn = checkInTime;
            existing.Status  = status;
            attendance       = existing;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(attendance, $"{employee.FirstName} {employee.LastName}");
    }

    public async Task<AttendanceDto> CheckOutAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with id '{employeeId}' was not found.");

        var today = DateOnly.FromDateTime(DateTime.Now);

        var attendance = await _context.Attendances
            .Include(a => a.Breaks)
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == today && a.CheckIn != null, cancellationToken)
            ?? throw new InvalidOperationException("No active check-in found for today. Please check in first.");

        if (attendance.CheckOut is not null)
            throw new InvalidOperationException("Employee has already checked out today.");

        var checkOutTime = TimeOnly.FromDateTime(DateTime.Now);

        // Auto-end any ongoing break
        var ongoingBreak = attendance.Breaks.FirstOrDefault(b => b.BreakEnd is null);
        if (ongoingBreak is not null)
            ongoingBreak.BreakEnd = checkOutTime;

        var grossHours = (decimal)(checkOutTime - attendance.CheckIn!.Value).TotalHours;
        var breakHours = attendance.Breaks
            .Where(b => b.BreakEnd.HasValue)
            .Sum(b => (decimal)(b.BreakEnd!.Value - b.BreakStart).TotalHours);
        var workHours = Math.Max(grossHours - breakHours, 0m);

        attendance.CheckOut  = checkOutTime;
        attendance.WorkHours = workHours;

        if (workHours < 4m)
            attendance.Status = AttendanceStatus.HalfDay;

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(attendance, $"{employee.FirstName} {employee.LastName}");
    }

    public async Task<AttendanceDto> StartBreakAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with id '{employeeId}' was not found.");

        var today = DateOnly.FromDateTime(DateTime.Now);

        var attendance = await _context.Attendances
            .Include(a => a.Breaks)
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == today && a.CheckIn != null, cancellationToken)
            ?? throw new InvalidOperationException("You must check in before starting a break.");

        if (attendance.CheckOut is not null)
            throw new InvalidOperationException("Cannot start a break after checking out.");

        if (attendance.Breaks.Any(b => b.BreakEnd is null))
            throw new InvalidOperationException("You are already on a break.");

        var newBreak = new AttendanceBreak
        {
            AttendanceId = attendance.Id,
            BreakStart   = TimeOnly.FromDateTime(DateTime.Now),
        };
        _context.AttendanceBreaks.Add(newBreak);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(attendance, $"{employee.FirstName} {employee.LastName}");
    }

    public async Task<AttendanceDto> EndBreakAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with id '{employeeId}' was not found.");

        var today = DateOnly.FromDateTime(DateTime.Now);

        var attendance = await _context.Attendances
            .Include(a => a.Breaks)
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == today && a.CheckIn != null, cancellationToken)
            ?? throw new InvalidOperationException("No active check-in found for today.");

        var ongoingBreak = attendance.Breaks.FirstOrDefault(b => b.BreakEnd is null)
            ?? throw new InvalidOperationException("No active break to end.");

        ongoingBreak.BreakEnd = TimeOnly.FromDateTime(DateTime.Now);

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(attendance, $"{employee.FirstName} {employee.LastName}");
    }

    public async Task<MonthlyReportDto> GetMonthlyReportAsync(
        Guid employeeId, int month, int year,
        CancellationToken cancellationToken = default)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId, cancellationToken)
            ?? throw new KeyNotFoundException($"Employee with id '{employeeId}' was not found.");

        var records = await _context.Attendances
            .Include(a => a.Breaks)
            .Where(a => a.EmployeeId == employeeId && a.Date.Month == month && a.Date.Year == year)
            .OrderBy(a => a.Date)
            .ToListAsync(cancellationToken);

        var employeeName = $"{employee.FirstName} {employee.LastName}";

        return new MonthlyReportDto
        {
            EmployeeId     = employeeId,
            EmployeeName   = employeeName,
            Month          = month,
            Year           = year,
            TotalPresent   = records.Count(r => r.Status == AttendanceStatus.Present),
            TotalLate      = records.Count(r => r.Status == AttendanceStatus.Late),
            TotalHalfDay   = records.Count(r => r.Status == AttendanceStatus.HalfDay),
            TotalAbsent    = records.Count(r => r.Status == AttendanceStatus.Absent),
            TotalWorkHours = records.Sum(r => r.WorkHours ?? 0m),
            Records        = records.Select(r => MapToDto(r, employeeName)).ToList(),
        };
    }

    public async Task<IReadOnlyList<TeamSummaryDto>> GetTeamSummaryAsync(
        Guid departmentId, DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var employees = await _context.Employees
            .Where(e => e.DepartmentId == departmentId)
            .Select(e => new
            {
                e.Id,
                EmployeeName   = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : string.Empty,
            })
            .ToListAsync(cancellationToken);

        return await BuildTeamDailyAsync(employees.Select(e => (e.Id, e.EmployeeName, e.DepartmentName)).ToList(), date, cancellationToken);
    }

    public async Task<IReadOnlyList<TeamSummaryDto>> GetManagerTeamDailyAsync(
        Guid managerId, DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var employees = await _context.Employees
            .Where(e => e.ManagerId == managerId)
            .Select(e => new
            {
                e.Id,
                EmployeeName   = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : string.Empty,
            })
            .ToListAsync(cancellationToken);

        return await BuildTeamDailyAsync(employees.Select(e => (e.Id, e.EmployeeName, e.DepartmentName)).ToList(), date, cancellationToken);
    }

    public async Task<IReadOnlyList<TeamSummaryDto>> GetCompanyDailyAsync(
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var employees = await _context.Employees
            .Select(e => new
            {
                e.Id,
                EmployeeName   = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : string.Empty,
            })
            .ToListAsync(cancellationToken);

        return await BuildTeamDailyAsync(employees.Select(e => (e.Id, e.EmployeeName, e.DepartmentName)).ToList(), date, cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeMonthlySummaryDto>> GetManagerTeamMonthlyAsync(
        Guid managerId, int month, int year,
        CancellationToken cancellationToken = default)
    {
        var employees = await _context.Employees
            .Where(e => e.ManagerId == managerId)
            .Select(e => new
            {
                e.Id,
                EmployeeName   = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : string.Empty,
            })
            .ToListAsync(cancellationToken);

        return await BuildMonthlyAsync(employees.Select(e => (e.Id, e.EmployeeName, e.DepartmentName)).ToList(), month, year, cancellationToken);
    }

    public async Task<IReadOnlyList<EmployeeMonthlySummaryDto>> GetCompanyMonthlyAsync(
        int month, int year,
        CancellationToken cancellationToken = default)
    {
        var employees = await _context.Employees
            .Select(e => new
            {
                e.Id,
                EmployeeName   = e.FirstName + " " + e.LastName,
                DepartmentName = e.Department != null ? e.Department.Name : string.Empty,
            })
            .ToListAsync(cancellationToken);

        return await BuildMonthlyAsync(employees.Select(e => (e.Id, e.EmployeeName, e.DepartmentName)).ToList(), month, year, cancellationToken);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private async Task<IReadOnlyList<TeamSummaryDto>> BuildTeamDailyAsync(
        List<(Guid Id, string EmployeeName, string DepartmentName)> employees,
        DateOnly date, CancellationToken cancellationToken)
    {
        var ids         = employees.Select(e => e.Id).ToList();
        var attendances = await _context.Attendances
            .Include(a => a.Breaks)
            .Where(a => ids.Contains(a.EmployeeId) && a.Date == date)
            .ToListAsync(cancellationToken);

        return employees
            .Select(e =>
            {
                var att = attendances.FirstOrDefault(a => a.EmployeeId == e.Id);
                return new TeamSummaryDto
                {
                    EmployeeId   = e.Id,
                    EmployeeName = e.EmployeeName,
                    Department   = e.DepartmentName,
                    Status       = att?.Status.ToString() ?? "Absent",
                    CheckIn      = att?.CheckIn,
                    CheckOut     = att?.CheckOut,
                    Breaks       = att?.Breaks.OrderBy(b => b.BreakStart)
                                       .Select(b => new BreakDto { BreakStart = b.BreakStart, BreakEnd = b.BreakEnd })
                                       .ToList() ?? new List<BreakDto>(),
                    WorkHours    = att?.WorkHours,
                };
            })
            .ToList();
    }

    private async Task<IReadOnlyList<EmployeeMonthlySummaryDto>> BuildMonthlyAsync(
        List<(Guid Id, string EmployeeName, string DepartmentName)> employees,
        int month, int year, CancellationToken cancellationToken)
    {
        var ids     = employees.Select(e => e.Id).ToList();
        var records = await _context.Attendances
            .Where(a => ids.Contains(a.EmployeeId) && a.Date.Month == month && a.Date.Year == year)
            .ToListAsync(cancellationToken);

        return employees
            .Select(e =>
            {
                var emp = records.Where(r => r.EmployeeId == e.Id).ToList();
                return new EmployeeMonthlySummaryDto
                {
                    EmployeeId     = e.Id,
                    EmployeeName   = e.EmployeeName,
                    Department     = e.DepartmentName,
                    Month          = month,
                    Year           = year,
                    TotalPresent   = emp.Count(r => r.Status == AttendanceStatus.Present),
                    TotalLate      = emp.Count(r => r.Status == AttendanceStatus.Late),
                    TotalHalfDay   = emp.Count(r => r.Status == AttendanceStatus.HalfDay),
                    TotalAbsent    = emp.Count(r => r.Status == AttendanceStatus.Absent),
                    TotalWorkHours = emp.Sum(r => r.WorkHours ?? 0m),
                };
            })
            .OrderBy(e => e.EmployeeName)
            .ToList();
    }

    private static AttendanceDto MapToDto(Attendance a, string employeeName) => new()
    {
        Id           = a.Id,
        EmployeeId   = a.EmployeeId,
        EmployeeName = employeeName,
        Date         = a.Date,
        CheckIn      = a.CheckIn,
        CheckOut     = a.CheckOut,
        Breaks       = a.Breaks.OrderBy(b => b.BreakStart)
                           .Select(b => new BreakDto { BreakStart = b.BreakStart, BreakEnd = b.BreakEnd })
                           .ToList(),
        WorkHours    = a.WorkHours,
        Status       = a.Status.ToString(),
    };
}
