using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class Applicant : BaseEntity
{
    public Guid JobPostingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Resume { get; set; } = string.Empty;
    public ApplicantStatus Status { get; set; } = ApplicantStatus.Applied;

    public JobPosting JobPosting { get; set; } = null!;
}
