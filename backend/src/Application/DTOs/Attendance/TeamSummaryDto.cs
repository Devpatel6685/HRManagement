namespace HRManagement.Application.DTOs.Attendance;

public class TeamSummaryDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public TimeOnly? CheckIn { get; set; }
    public TimeOnly? CheckOut { get; set; }
    public List<BreakDto> Breaks { get; set; } = new();
    public decimal? WorkHours { get; set; }
}
