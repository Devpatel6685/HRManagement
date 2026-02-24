using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class JobPosting : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Openings { get; set; }
    public JobPostingStatus Status { get; set; } = JobPostingStatus.Open;
    public DateTime PostedOn { get; set; } = DateTime.UtcNow;

    public Department Department { get; set; } = null!;
    public ICollection<Applicant> Applicants { get; set; } = new List<Applicant>();
}
