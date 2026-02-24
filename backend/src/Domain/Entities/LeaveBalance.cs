using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class LeaveBalance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid LeaveTypeId { get; set; }
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }

    public Employee Employee { get; set; } = null!;
    public LeaveType LeaveType { get; set; } = null!;
}
