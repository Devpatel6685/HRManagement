using HRManagement.Application.DTOs.Recruitment;
using HRManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.API.Controllers;

[ApiController]
[Route("api/applicants")]
[Authorize(Roles = "Admin,HR")]
public class ApplicantsController : ControllerBase
{
    private readonly IApplicantService _applicantService;

    public ApplicantsController(IApplicantService applicantService)
    {
        _applicantService = applicantService;
    }

    // POST /api/applicants/job/{jobId}  (multipart/form-data)
    [HttpPost("job/{jobId:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Add(
        Guid jobId,
        [FromForm] AddApplicantDto dto,
        IFormFile? resume,
        CancellationToken ct)
    {
        var applicant = await _applicantService.AddApplicantAsync(
            jobId, dto,
            resume?.OpenReadStream(),
            resume?.FileName,
            ct);
        return CreatedAtAction(nameof(GetById), new { id = applicant.Id }, applicant);
    }

    // GET /api/applicants/job/{jobId}/kanban
    [HttpGet("job/{jobId:guid}/kanban")]
    public async Task<IActionResult> GetKanban(Guid jobId, CancellationToken ct)
    {
        var board = await _applicantService.GetKanbanAsync(jobId, ct);
        return Ok(board);
    }

    // GET /api/applicants/job/{jobId}
    [HttpGet("job/{jobId:guid}")]
    public async Task<IActionResult> GetByJob(Guid jobId, CancellationToken ct)
    {
        var list = await _applicantService.GetByJobAsync(jobId, ct);
        return Ok(list);
    }

    // GET /api/applicants/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var applicant = await _applicantService.GetByIdAsync(id, ct);
        return Ok(applicant);
    }

    // PUT /api/applicants/{id}/status
    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] UpdateApplicantStatusDto dto, CancellationToken ct)
    {
        var applicant = await _applicantService.UpdateStatusAsync(id, dto, ct);
        return Ok(applicant);
    }

    // GET /api/applicants/{id}/resume
    [HttpGet("{id:guid}/resume")]
    public async Task<IActionResult> GetResume(Guid id, CancellationToken ct)
    {
        var (bytes, fileName, contentType) = await _applicantService.GetResumeAsync(id, ct);
        return File(bytes, contentType, fileName);
    }
}
