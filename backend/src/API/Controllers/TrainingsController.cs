using HRManagement.Application.DTOs.Training;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/trainings")]
[Authorize]
public class TrainingsController : ControllerBase
{
    private readonly ITrainingService _service;

    public TrainingsController(ITrainingService service)
    {
        _service = service;
    }

    // GET /api/trainings — all roles
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _service.GetAllTrainingsAsync(ct);
        return Ok(list);
    }

    // GET /api/trainings/upcoming — all roles
    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcoming(CancellationToken ct)
    {
        var list = await _service.GetUpcomingTrainingsAsync(ct);
        return Ok(list);
    }

    // POST /api/trainings — Admin, HR
    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create([FromBody] CreateTrainingDto dto, CancellationToken ct)
    {
        var result = await _service.CreateTrainingAsync(dto, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    // DELETE /api/trainings/{id} — Admin, HR
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteTrainingAsync(id, ct);
        return NoContent();
    }

    // POST /api/trainings/{id}/assign — Admin, HR
    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> AssignEmployees(Guid id, [FromBody] AssignEmployeesDto dto, CancellationToken ct)
    {
        var result = await _service.AssignEmployeesAsync(id, dto, ct);
        return Ok(result);
    }

    // POST /api/trainings/employee-trainings/{etId}/complete — Admin, HR
    [HttpPost("employee-trainings/{etId:guid}/complete")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> MarkCompleted(Guid etId, [FromBody] MarkCompletedDto dto, CancellationToken ct)
    {
        var result = await _service.MarkCompletedAsync(etId, dto, ct);
        return Ok(result);
    }

    // GET /api/trainings/my/{employeeId} — all roles
    [HttpGet("my/{employeeId:guid}")]
    public async Task<IActionResult> GetMyTrainings(Guid employeeId, CancellationToken ct)
    {
        var list = await _service.GetMyTrainingsAsync(employeeId, ct);
        return Ok(list);
    }
}
