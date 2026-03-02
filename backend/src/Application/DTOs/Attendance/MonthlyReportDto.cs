namespace HRManagement.Application.DTOs.Attendance;

public class MonthlyReportDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public int TotalPresent { get; set; }
    public int TotalLate { get; set; }
    public int TotalHalfDay { get; set; }
    public int TotalAbsent { get; set; }
    public decimal TotalWorkHours { get; set; }
    public IReadOnlyList<AttendanceDto> Records { get; set; } = [];
}
