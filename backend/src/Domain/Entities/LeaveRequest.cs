using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class LeaveRequest : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid LeaveTypeId { get; set; }
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public LeaveRequestStatus Status { get; set; } = LeaveRequestStatus.Pending;
    public Guid? ApprovedById { get; set; }

    public Employee Employee { get; set; } = null!;
    public LeaveType LeaveType { get; set; } = null!;
    public Employee? ApprovedBy { get; set; }
}
