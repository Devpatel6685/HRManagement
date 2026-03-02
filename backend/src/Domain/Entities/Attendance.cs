using HRManagement.Domain.Common;
using HRManagement.Domain.Enums;

namespace HRManagement.Domain.Entities;

public class Attendance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly? CheckIn { get; set; }
    public TimeOnly? CheckOut { get; set; }
    public decimal? WorkHours { get; set; }
    public AttendanceStatus Status { get; set; }

    public Employee Employee { get; set; } = null!;
    public ICollection<AttendanceBreak> Breaks { get; set; } = new List<AttendanceBreak>();
}
