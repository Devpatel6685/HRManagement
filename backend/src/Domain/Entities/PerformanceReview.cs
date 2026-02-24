using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class PerformanceReview : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid ReviewerId { get; set; }
    public string Period { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }

    public Employee Employee { get; set; } = null!;
    public Employee Reviewer { get; set; } = null!;
}
