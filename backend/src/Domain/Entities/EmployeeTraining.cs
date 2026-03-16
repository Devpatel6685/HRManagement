using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class EmployeeTraining : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid TrainingId { get; set; }
    public EmployeeTrainingStatus Status { get; set; } = EmployeeTrainingStatus.Enrolled;
    public DateTime? CompletionDate { get; set; }
    public decimal? Score { get; set; }

    public Employee Employee { get; set; } = null!;
    public Training Training { get; set; } = null!;
}
