using HRManagement.Application.DTOs.Recruitment;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/job-postings")]
[Authorize]
public class JobPostingsController : ControllerBase
{
    private readonly IJobPostingService _jobPostingService;

    public JobPostingsController(IJobPostingService jobPostingService)
    {
        _jobPostingService = jobPostingService;
    }

    // GET /api/job-postings?status=Open&departmentId=
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] Guid? departmentId,
        CancellationToken ct)
    {
        var list = await _jobPostingService.GetAllAsync(status, departmentId, ct);
        return Ok(list);
    }

    // GET /api/job-postings/{id}
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var job = await _jobPostingService.GetByIdAsync(id, ct);
        return Ok(job);
    }

    // POST /api/job-postings
    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create([FromBody] CreateJobPostingDto dto, CancellationToken ct)
    {
        var job = await _jobPostingService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    // PUT /api/job-postings/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobPostingDto dto, CancellationToken ct)
    {
        var job = await _jobPostingService.UpdateAsync(id, dto, ct);
        return Ok(job);
    }

    // PUT /api/job-postings/{id}/close
    [HttpPut("{id:guid}/close")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct)
    {
        await _jobPostingService.CloseAsync(id, ct);
        return NoContent();
    }

    // DELETE /api/job-postings/{id}
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _jobPostingService.DeleteAsync(id, ct);
        return NoContent();
    }
}
