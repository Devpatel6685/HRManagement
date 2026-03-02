using HRManagement.Application.DTOs.Payroll;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/payroll")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _payrollService;

    public PayrollController(IPayrollService payrollService)
    {
        _payrollService = payrollService;
    }

    // POST /api/payroll/generate — Admin, HR
    [HttpPost("generate")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Generate(
        [FromBody] GeneratePayrollDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _payrollService.GeneratePayrollAsync(dto, cancellationToken);
        return Ok(result);
    }

    // GET /api/payroll/all — Admin, HR
    [HttpGet("all")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _payrollService.GetAllPayrollAsync(cancellationToken);
        return Ok(list);
    }

    // GET /api/payroll/employee/{id} — Admin, HR only
    [HttpGet("employee/{employeeId:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetHistory(
        Guid employeeId,
        CancellationToken cancellationToken)
    {
        var list = await _payrollService.GetPayrollHistoryAsync(employeeId, cancellationToken);
        return Ok(list);
    }

    // GET /api/payroll/{id}/download — Admin, HR only
    [HttpGet("{id:guid}/download")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var bytes = await _payrollService.GeneratePdfPayslipAsync(id, cancellationToken);
        return File(bytes, "application/pdf", $"payslip-{id}.pdf");
    }

    // PUT /api/payroll/{id}/mark-paid — Admin, HR
    [HttpPut("{id:guid}/mark-paid")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> MarkPaid(Guid id, CancellationToken cancellationToken)
    {
        var result = await _payrollService.MarkAsPaidAsync(id, cancellationToken);
        return Ok(result);
    }
}
