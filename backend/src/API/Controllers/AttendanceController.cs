using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    /// <summary>Check in for the authenticated employee.</summary>
    [HttpPost("check-in/{employeeId:guid}")]
    public async Task<IActionResult> CheckIn(Guid employeeId, CancellationToken cancellationToken)
    {
        var result = await _attendanceService.CheckInAsync(employeeId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Check out for the authenticated employee.</summary>
    [HttpPost("check-out/{employeeId:guid}")]
    public async Task<IActionResult> CheckOut(Guid employeeId, CancellationToken cancellationToken)
    {
        var result = await _attendanceService.CheckOutAsync(employeeId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Start a break for the authenticated employee.</summary>
    [HttpPost("break-start/{employeeId:guid}")]
    public async Task<IActionResult> BreakStart(Guid employeeId, CancellationToken cancellationToken)
    {
        var result = await _attendanceService.StartBreakAsync(employeeId, cancellationToken);
        return Ok(result);
    }

    /// <summary>End the current break for the authenticated employee.</summary>
    [HttpPost("break-end/{employeeId:guid}")]
    public async Task<IActionResult> BreakEnd(Guid employeeId, CancellationToken cancellationToken)
    {
        var result = await _attendanceService.EndBreakAsync(employeeId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Monthly attendance report for an employee.</summary>
    [HttpGet("monthly/{employeeId:guid}")]
    public async Task<IActionResult> GetMonthlyReport(
        Guid employeeId,
        [FromQuery] int month,
        [FromQuery] int year,
        CancellationToken cancellationToken)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { error = "Month must be between 1 and 12." });

        var report = await _attendanceService.GetMonthlyReportAsync(employeeId, month, year, cancellationToken);
        return Ok(report);
    }

    /// <summary>Attendance summary for all employees in a department on a given date.</summary>
    [HttpGet("team/{departmentId:guid}")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> GetTeamSummary(
        Guid departmentId,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var summary = await _attendanceService.GetTeamSummaryAsync(departmentId, date, cancellationToken);
        return Ok(summary);
    }

    /// <summary>Daily attendance for a manager's direct reports.</summary>
    [HttpGet("manager/{managerId:guid}/daily")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> GetManagerTeamDaily(
        Guid managerId,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var summary = await _attendanceService.GetManagerTeamDailyAsync(managerId, date, cancellationToken);
        return Ok(summary);
    }

    /// <summary>Daily attendance for all company employees (HR/Admin only).</summary>
    [HttpGet("company/daily")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetCompanyDaily(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var summary = await _attendanceService.GetCompanyDailyAsync(date, cancellationToken);
        return Ok(summary);
    }

    /// <summary>Monthly attendance summary for a manager's direct reports.</summary>
    [HttpGet("manager/{managerId:guid}/monthly")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> GetManagerTeamMonthly(
        Guid managerId,
        [FromQuery] int month,
        [FromQuery] int year,
        CancellationToken cancellationToken)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { error = "Month must be between 1 and 12." });

        var summary = await _attendanceService.GetManagerTeamMonthlyAsync(managerId, month, year, cancellationToken);
        return Ok(summary);
    }

    /// <summary>Monthly attendance summary for all company employees (HR/Admin only).</summary>
    [HttpGet("company/monthly")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetCompanyMonthly(
        [FromQuery] int month,
        [FromQuery] int year,
        CancellationToken cancellationToken)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { error = "Month must be between 1 and 12." });

        var summary = await _attendanceService.GetCompanyMonthlyAsync(month, year, cancellationToken);
        return Ok(summary);
    }
}
