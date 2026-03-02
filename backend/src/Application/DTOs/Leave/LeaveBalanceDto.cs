namespace HRManagement.Application.DTOs.Leave;

public class LeaveBalanceDto
{
    public Guid Id { get; set; }
    public Guid LeaveTypeId { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public int Year { get; set; }
    public int TotalDays { get; set; }
    public int UsedDays { get; set; }
    public int RemainingDays { get; set; }
}
