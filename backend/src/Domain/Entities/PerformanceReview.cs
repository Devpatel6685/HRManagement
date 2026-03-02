using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class PerformanceReview : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid ReviewerId { get; set; }
    public string Period { get; set; } = string.Empty;
    public int Rating { get; set; }           // 1–5
    public string Comments { get; set; } = string.Empty;
    public string? Strengths { get; set; }
    public string? Improvements { get; set; }
    public DateTime ReviewDate { get; set; }

    public Employee Employee { get; set; } = null!;
    public Employee Reviewer { get; set; } = null!;
}
