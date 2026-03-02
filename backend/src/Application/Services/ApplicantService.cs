using HRManagement.Application.DTOs.Recruitment;
using HRManagement.Application.Interfaces;
using HRManagement.Domain.Entities;
using HRManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRManagement.Application.Services;

public class ApplicantService : IApplicantService
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly string _uploadsRoot;

    public ApplicantService(
        IApplicationDbContext context,
        IEmailService emailService,
        IPasswordHasher passwordHasher)
    {
        _context       = context;
        _emailService  = emailService;
        _passwordHasher = passwordHasher;
        _uploadsRoot   = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
        Directory.CreateDirectory(_uploadsRoot);
    }

    public async Task<ApplicantDto> AddApplicantAsync(
        Guid jobId, AddApplicantDto dto, Stream? resumeStream, string? resumeFileName, CancellationToken ct = default)
    {
        var job = await _context.JobPostings.FindAsync([jobId], ct)
            ?? throw new KeyNotFoundException("Job posting not found.");

        if (job.Status != JobPostingStatus.Open)
            throw new InvalidOperationException("This job posting is not accepting applications.");

        // Save resume file
        string resumePath = string.Empty;

        if (resumeStream is not null && resumeFileName is not null)
        {
            var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(resumeFileName)}";
            resumePath = Path.Combine(_uploadsRoot, uniqueName);
            using var fileStream = File.Create(resumePath);
            await resumeStream.CopyToAsync(fileStream, ct);
        }

        var applicant = new Applicant
        {
            JobPostingId   = jobId,
            Name           = dto.Name,
            Email          = dto.Email,
            Phone          = dto.Phone,
            Resume         = resumePath,
            ResumeFileName = resumeFileName,
            Status         = ApplicantStatus.Applied,
            AppliedOn      = DateTime.UtcNow,
            Notes          = dto.Notes,
        };

        _context.Applicants.Add(applicant);
        await _context.SaveChangesAsync(ct);

        applicant.JobPosting = job;
        return MapToDto(applicant);
    }

    public async Task<KanbanBoardDto> GetKanbanAsync(Guid jobId, CancellationToken ct = default)
    {
        var applicants = await _context.Applicants
            .Include(a => a.JobPosting)
            .Where(a => a.JobPostingId == jobId)
            .OrderBy(a => a.AppliedOn)
            .ToListAsync(ct);

        var board = new KanbanBoardDto();
        foreach (var a in applicants)
        {
            var dto = MapToDto(a);
            switch (a.Status)
            {
                case ApplicantStatus.Applied:     board.Applied.Add(dto);     break;
                case ApplicantStatus.Shortlisted: board.Shortlisted.Add(dto); break;
                case ApplicantStatus.Interviewed: board.Interviewed.Add(dto); break;
                case ApplicantStatus.Offered:     board.Offered.Add(dto);     break;
                case ApplicantStatus.Hired:       board.Hired.Add(dto);       break;
                case ApplicantStatus.Rejected:    board.Rejected.Add(dto);    break;
            }
        }
        return board;
    }

    public async Task<IReadOnlyList<ApplicantDto>> GetByJobAsync(Guid jobId, CancellationToken ct = default)
    {
        var list = await _context.Applicants
            .Include(a => a.JobPosting)
            .Where(a => a.JobPostingId == jobId)
            .OrderByDescending(a => a.AppliedOn)
            .ToListAsync(ct);

        return list.Select(MapToDto).ToList();
    }

    public async Task<ApplicantDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var applicant = await _context.Applicants
            .Include(a => a.JobPosting)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Applicant '{id}' not found.");

        return MapToDto(applicant);
    }

    public async Task<ApplicantDto> UpdateStatusAsync(
        Guid id, UpdateApplicantStatusDto dto, CancellationToken ct = default)
    {
        var applicant = await _context.Applicants
            .Include(a => a.JobPosting).ThenInclude(j => j.Department)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new KeyNotFoundException($"Applicant '{id}' not found.");

        if (!Enum.TryParse<ApplicantStatus>(dto.Status, true, out var newStatus))
            throw new ArgumentException($"Invalid status '{dto.Status}'.");

        applicant.Status = newStatus;

        if (!string.IsNullOrWhiteSpace(dto.Notes))
            applicant.Notes = dto.Notes;

        if (newStatus == ApplicantStatus.Hired)
            await HireApplicantAsync(applicant, ct);

        await _context.SaveChangesAsync(ct);
        return MapToDto(applicant);
    }

    public async Task<(byte[] FileBytes, string FileName, string ContentType)> GetResumeAsync(
        Guid id, CancellationToken ct = default)
    {
        var applicant = await _context.Applicants.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Applicant '{id}' not found.");

        if (string.IsNullOrEmpty(applicant.Resume) || !File.Exists(applicant.Resume))
            throw new KeyNotFoundException("Resume file not found.");

        var bytes = await File.ReadAllBytesAsync(applicant.Resume, ct);
        var fileName = applicant.ResumeFileName ?? Path.GetFileName(applicant.Resume);
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = ext == ".pdf" ? "application/pdf" : "application/octet-stream";

        return (bytes, fileName, contentType);
    }

    // ── Hire flow ─────────────────────────────────────────────────────────

    private async Task HireApplicantAsync(Applicant applicant, CancellationToken ct)
    {
        if (await _context.Users.AnyAsync(u => u.Email == applicant.Email, ct))
            throw new InvalidOperationException(
                $"A user account with email '{applicant.Email}' already exists.");

        var employeeRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Employee", ct)
            ?? throw new KeyNotFoundException("Employee role not found.");

        var tempPassword = $"Welcome@{new Random().Next(1000, 9999)}";

        var user = new User
        {
            Email        = applicant.Email,
            PasswordHash = _passwordHasher.Hash(tempPassword),
            RoleId       = employeeRole.Id,
            IsActive     = true,
        };
        _context.Users.Add(user);

        var nameParts = applicant.Name.Trim().Split(' ', 2);
        var employee = new Employee
        {
            UserId       = user.Id,
            EmployeeCode = $"EMP{DateTime.UtcNow:yyyyMMddHHmmss}",
            FirstName    = nameParts[0],
            LastName     = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            Phone        = applicant.Phone,
            JoinDate     = DateOnly.FromDateTime(DateTime.UtcNow),
            Status       = EmployeeStatus.Active,
            DepartmentId = applicant.JobPosting.DepartmentId,
        };
        _context.Employees.Add(employee);

        // Seed leave balances
        var leaveTypes  = await _context.LeaveTypes.ToListAsync(ct);
        var currentYear = DateTime.UtcNow.Year;
        foreach (var lt in leaveTypes)
        {
            _context.LeaveBalances.Add(new LeaveBalance
            {
                EmployeeId  = employee.Id,
                LeaveTypeId = lt.Id,
                Year        = currentYear,
                TotalDays   = lt.MaxDaysPerYear,
                UsedDays    = 0,
            });
        }

        // Reduce openings
        applicant.JobPosting.Openings = Math.Max(0, applicant.JobPosting.Openings - 1);
        if (applicant.JobPosting.Openings == 0)
        {
            applicant.JobPosting.Status  = JobPostingStatus.Closed;
            applicant.JobPosting.ClosedOn = DateTime.UtcNow;
        }

        // Send welcome email (fire-and-forget — don't fail the hire if email fails)
        try
        {
            await _emailService.SendWelcomeEmailAsync(
                applicant.Email, nameParts[0], tempPassword, applicant.JobPosting.Title);
        }
        catch { /* logged inside EmailService */ }
    }

    // ── Mapping ───────────────────────────────────────────────────────────

    private static ApplicantDto MapToDto(Applicant a) => new()
    {
        Id             = a.Id,
        JobPostingId   = a.JobPostingId,
        JobTitle       = a.JobPosting?.Title ?? string.Empty,
        Name           = a.Name,
        Email          = a.Email,
        Phone          = a.Phone,
        ResumeFileName = a.ResumeFileName,
        HasResume      = !string.IsNullOrEmpty(a.Resume) && File.Exists(a.Resume),
        Status         = a.Status.ToString(),
        AppliedOn      = a.AppliedOn,
        Notes          = a.Notes,
    };
}
