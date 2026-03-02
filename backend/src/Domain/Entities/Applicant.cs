using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class Applicant : BaseEntity
{
    public Guid JobPostingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Resume { get; set; } = string.Empty;       // file path
    public string? ResumeFileName { get; set; }              // original filename
    public ApplicantStatus Status { get; set; } = ApplicantStatus.Applied;
    public DateTime AppliedOn { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }

    public JobPosting JobPosting { get; set; } = null!;
}
