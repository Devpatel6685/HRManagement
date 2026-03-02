using HRManagement.Domain.Common;

namespace HRManagement.Domain.Entities;

public class AttendanceBreak : BaseEntity
{
    public Guid AttendanceId { get; set; }
    public TimeOnly BreakStart { get; set; }
    public TimeOnly? BreakEnd { get; set; }

    public Attendance Attendance { get; set; } = null!;
}
