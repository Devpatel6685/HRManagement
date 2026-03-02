namespace HRManagement.Application.DTOs.Leave;

public class ApplyLeaveDto
{
    public Guid LeaveTypeId { get; set; }
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool AvailableOnPhone { get; set; }
    public string? AlternativePhone { get; set; }
}
