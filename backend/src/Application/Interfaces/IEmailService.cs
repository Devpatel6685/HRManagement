namespace HRManagement.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string toName, string resetToken);

    Task SendLeaveRequestNotificationAsync(
        string toEmail, string toName,
        string employeeName, string leaveType,
        string fromDate, string toDate, int days);

    Task SendLeaveApprovedEmailAsync(
        string toEmail, string toName,
        string leaveType, string fromDate, string toDate);

    Task SendLeaveRejectedEmailAsync(
        string toEmail, string toName,
        string leaveType, string fromDate, string toDate, string reason);

    Task SendWelcomeEmailAsync(string toEmail, string toName, string tempPassword, string jobTitle);
}
