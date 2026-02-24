using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class LeaveType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int MaxDaysPerYear { get; set; }

    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
}
