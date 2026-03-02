using HRManagement.Application.DTOs.Performance;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/performance-reviews")]
[Authorize]
public class PerformanceReviewsController : ControllerBase
{
    private readonly IPerformanceReviewService _service;

    public PerformanceReviewsController(IPerformanceReviewService service)
    {
        _service = service;
    }

    // GET /api/performance-reviews — Admin, HR
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _service.GetAllReviewsAsync(ct);
        return Ok(list);
    }

    // GET /api/performance-reviews/employee/{employeeId}
    [HttpGet("employee/{employeeId:guid}")]
    public async Task<IActionResult> GetByEmployee(Guid employeeId, CancellationToken ct)
    {
        var list = await _service.GetEmployeeReviewsAsync(employeeId, ct);
        return Ok(list);
    }

    // GET /api/performance-reviews/employee/{employeeId}/average
    [HttpGet("employee/{employeeId:guid}/average")]
    public async Task<IActionResult> GetAverage(Guid employeeId, CancellationToken ct)
    {
        var avg = await _service.GetAverageRatingAsync(employeeId, ct);
        return Ok(avg);
    }

    // POST /api/performance-reviews — Admin, HR, Manager
    [HttpPost]
    [Authorize(Roles = "Admin,HR,Manager")]
    public async Task<IActionResult> Add([FromBody] AddReviewDto dto, CancellationToken ct)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var review = await _service.AddReviewAsync(dto, role, ct);
        return Ok(review);
    }

    // DELETE /api/performance-reviews/{id} — Admin, HR
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteReviewAsync(id, ct);
        return NoContent();
    }
}
