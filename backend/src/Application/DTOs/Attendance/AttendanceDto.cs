namespace HRManagement.Application.DTOs.Attendance;

public class AttendanceDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public TimeOnly? CheckIn { get; set; }
    public TimeOnly? CheckOut { get; set; }
    public List<BreakDto> Breaks { get; set; } = new();
    public decimal? WorkHours { get; set; }
    public string Status { get; set; } = string.Empty;
}
