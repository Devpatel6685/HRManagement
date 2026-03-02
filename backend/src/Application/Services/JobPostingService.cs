using HRManagement.Application.DTOs.Recruitment;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class JobPostingService : IJobPostingService
{
    private readonly IApplicationDbContext _context;

    public JobPostingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<JobPostingDto>> GetAllAsync(
        string? status, Guid? departmentId, CancellationToken ct = default)
    {
        var query = _context.JobPostings
            .Include(j => j.Department)
            .Include(j => j.Applicants)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<JobPostingStatus>(status, true, out var parsedStatus))
            query = query.Where(j => j.Status == parsedStatus);

        if (departmentId.HasValue)
            query = query.Where(j => j.DepartmentId == departmentId.Value);

        var list = await query.OrderByDescending(j => j.PostedOn).ToListAsync(ct);
        return list.Select(MapToDto).ToList();
    }

    public async Task<JobPostingDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var job = await _context.JobPostings
            .Include(j => j.Department)
            .Include(j => j.Applicants)
            .FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException($"Job posting '{id}' not found.");

        return MapToDto(job);
    }

    public async Task<JobPostingDto> CreateAsync(CreateJobPostingDto dto, CancellationToken ct = default)
    {
        var dept = await _context.Departments.FindAsync([dto.DepartmentId], ct)
            ?? throw new KeyNotFoundException("Department not found.");

        var job = new JobPosting
        {
            Title        = dto.Title,
            DepartmentId = dto.DepartmentId,
            Description  = dto.Description,
            Requirements = dto.Requirements,
            Openings     = dto.Openings,
            Status       = JobPostingStatus.Open,
            PostedOn     = DateTime.UtcNow,
        };

        _context.JobPostings.Add(job);
        await _context.SaveChangesAsync(ct);

        job.Department = dept;
        return MapToDto(job);
    }

    public async Task<JobPostingDto> UpdateAsync(Guid id, UpdateJobPostingDto dto, CancellationToken ct = default)
    {
        var job = await _context.JobPostings
            .Include(j => j.Department)
            .Include(j => j.Applicants)
            .FirstOrDefaultAsync(j => j.Id == id, ct)
            ?? throw new KeyNotFoundException($"Job posting '{id}' not found.");

        job.Title        = dto.Title;
        job.DepartmentId = dto.DepartmentId;
        job.Description  = dto.Description;
        job.Requirements = dto.Requirements;
        job.Openings     = dto.Openings;

        if (Enum.TryParse<JobPostingStatus>(dto.Status, true, out var parsedStatus))
        {
            if (parsedStatus == JobPostingStatus.Closed && job.Status != JobPostingStatus.Closed)
                job.ClosedOn = DateTime.UtcNow;
            job.Status = parsedStatus;
        }

        await _context.SaveChangesAsync(ct);
        return MapToDto(job);
    }

    public async Task CloseAsync(Guid id, CancellationToken ct = default)
    {
        var job = await _context.JobPostings.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Job posting '{id}' not found.");

        job.Status   = JobPostingStatus.Closed;
        job.ClosedOn = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var job = await _context.JobPostings.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Job posting '{id}' not found.");

        _context.JobPostings.Remove(job);
        await _context.SaveChangesAsync(ct);
    }

    private static JobPostingDto MapToDto(JobPosting j) => new()
    {
        Id             = j.Id,
        Title          = j.Title,
        DepartmentId   = j.DepartmentId,
        Department     = j.Department?.Name ?? string.Empty,
        Description    = j.Description,
        Requirements   = j.Requirements,
        Openings       = j.Openings,
        Status         = j.Status.ToString(),
        PostedOn       = j.PostedOn,
        ClosedOn       = j.ClosedOn,
        ApplicantCount = j.Applicants?.Count ?? 0,
    };
}
