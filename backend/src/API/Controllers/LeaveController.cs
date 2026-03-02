using System.Security.Claims;
using HRManagement.Application.DTOs.Leave;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/leave")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;

    public LeaveController(ILeaveService leaveService)
    {
        _leaveService = leaveService;
    }

    /// <summary>Apply for leave.</summary>
    [HttpPost("apply/{employeeId:guid}")]
    public async Task<IActionResult> Apply(
        Guid employeeId,
        [FromBody] ApplyLeaveDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _leaveService.ApplyLeaveAsync(employeeId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetRequests), new { employeeId }, result);
    }

    /// <summary>Approve a pending leave request.</summary>
    [HttpPost("{requestId:guid}/approve")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> Approve(
        Guid requestId,
        [FromQuery] Guid approverId,
        CancellationToken cancellationToken)
    {
        var result = await _leaveService.ApproveLeaveAsync(requestId, approverId, cancellationToken);
        return Ok(result);
    }

    /// <summary>Reject a pending leave request.</summary>
    [HttpPost("{requestId:guid}/reject")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> Reject(
        Guid requestId,
        [FromQuery] Guid approverId,
        [FromBody] RejectLeaveDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _leaveService.RejectLeaveAsync(requestId, approverId, dto.Reason, cancellationToken);
        return Ok(result);
    }

    /// <summary>Get all leave requests for an employee.</summary>
    [HttpGet("requests/{employeeId:guid}")]
    public async Task<IActionResult> GetRequests(Guid employeeId, CancellationToken cancellationToken)
    {
        var requests = await _leaveService.GetRequestsAsync(employeeId, cancellationToken);
        return Ok(requests);
    }

    /// <summary>Get pending leave requests relevant to the approver.</summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> GetPending(
        [FromQuery] Guid approverId,
        CancellationToken cancellationToken)
    {
        var role       = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var isHrOrAdmin = role is "Admin" or "HR";
        var requests   = await _leaveService.GetPendingRequestsAsync(approverId, isHrOrAdmin, cancellationToken);
        return Ok(requests);
    }

    /// <summary>Get leave balances for an employee for a given year.</summary>
    [HttpGet("balance/{employeeId:guid}")]
    public async Task<IActionResult> GetBalance(
        Guid employeeId,
        [FromQuery] int year,
        CancellationToken cancellationToken)
    {
        if (year < 2000 || year > 2100)
            return BadRequest(new { error = "Year must be between 2000 and 2100." });

        var balance = await _leaveService.GetBalanceAsync(employeeId, year, cancellationToken);
        return Ok(balance);
    }
}
