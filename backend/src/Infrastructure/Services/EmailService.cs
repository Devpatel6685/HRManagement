using HRManagement.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace HRManagement.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string toName, string resetToken)
    {
        var smtp = _configuration.GetSection("SmtpSettings");
        var resetLink = $"http://localhost:4200/auth/reset-password?token={Uri.EscapeDataString(resetToken)}";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(smtp["SenderName"] ?? "HR Management", smtp["User"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Password Reset Request — HR Management";

        message.Body = new BodyBuilder
        {
            HtmlBody = $"""
                <div style="font-family:Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                  <div style="text-align:center;margin-bottom:32px;">
                    <h1 style="color:#1565C0;margin:0;">HR Management</h1>
                  </div>
                  <h2 style="color:#1e293b;">Password Reset Request</h2>
                  <p style="color:#475569;">Hi <strong>{toName}</strong>,</p>
                  <p style="color:#475569;">
                    We received a request to reset the password for your HR Management account.
                    Click the button below to choose a new password.
                  </p>
                  <div style="text-align:center;margin:32px 0;">
                    <a href="{resetLink}"
                       style="display:inline-block;padding:14px 32px;background:#1565C0;color:#fff;
                              text-decoration:none;border-radius:8px;font-weight:600;font-size:1rem;">
                      Reset My Password
                    </a>
                  </div>
                  <p style="color:#94a3b8;font-size:0.875rem;">
                    This link expires in <strong>1 hour</strong>.<br/>
                    If you did not request a password reset, you can safely ignore this email.
                  </p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
                  <p style="color:#cbd5e1;font-size:0.75rem;text-align:center;">
                    HR Management System &bull; Confidential
                  </p>
                </div>
                """
        }.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(smtp["Host"], int.Parse(smtp["Port"] ?? "587"), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtp["User"], smtp["Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            _logger.LogInformation("Password reset email sent to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
            throw;
        }
    }

    public async Task SendLeaveRequestNotificationAsync(
        string toEmail, string toName,
        string employeeName, string leaveType,
        string fromDate, string toDate, int days)
    {
        var smtp = _configuration.GetSection("SmtpSettings");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(smtp["SenderName"] ?? "HR Management", smtp["User"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"Leave Request — {employeeName} ({leaveType})";

        message.Body = new BodyBuilder
        {
            HtmlBody = $"""
                <div style="font-family:Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                  <h1 style="color:#1565C0;margin:0 0 24px;">HR Management</h1>
                  <h2 style="color:#1e293b;">New Leave Request</h2>
                  <p style="color:#475569;">Hi <strong>{toName}</strong>,</p>
                  <p style="color:#475569;">
                    <strong>{employeeName}</strong> has submitted a leave request for your approval.
                  </p>
                  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr><td style="padding:8px;font-weight:600;color:#1e293b;">Leave Type</td><td style="padding:8px;color:#475569;">{leaveType}</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px;font-weight:600;color:#1e293b;">From</td><td style="padding:8px;color:#475569;">{fromDate}</td></tr>
                    <tr><td style="padding:8px;font-weight:600;color:#1e293b;">To</td><td style="padding:8px;color:#475569;">{toDate}</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px;font-weight:600;color:#1e293b;">Total Days</td><td style="padding:8px;color:#475569;">{days}</td></tr>
                  </table>
                  <p style="color:#475569;">Please log in to the HR Management system to review and take action.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
                  <p style="color:#cbd5e1;font-size:0.75rem;text-align:center;">HR Management System &bull; Confidential</p>
                </div>
                """
        }.ToMessageBody();

        await SendAsync(message, toEmail);
    }

    public async Task SendLeaveApprovedEmailAsync(
        string toEmail, string toName,
        string leaveType, string fromDate, string toDate)
    {
        var smtp = _configuration.GetSection("SmtpSettings");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(smtp["SenderName"] ?? "HR Management", smtp["User"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"Leave Approved — {leaveType} ({fromDate} – {toDate})";

        message.Body = new BodyBuilder
        {
            HtmlBody = $"""
                <div style="font-family:Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                  <h1 style="color:#1565C0;margin:0 0 24px;">HR Management</h1>
                  <h2 style="color:#16a34a;">Leave Request Approved ✓</h2>
                  <p style="color:#475569;">Hi <strong>{toName}</strong>,</p>
                  <p style="color:#475569;">Your leave request has been <strong style="color:#16a34a;">approved</strong>.</p>
                  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr><td style="padding:8px;font-weight:600;color:#1e293b;">Leave Type</td><td style="padding:8px;color:#475569;">{leaveType}</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px;font-weight:600;color:#1e293b;">From</td><td style="padding:8px;color:#475569;">{fromDate}</td></tr>
                    <tr><td style="padding:8px;font-weight:600;color:#1e293b;">To</td><td style="padding:8px;color:#475569;">{toDate}</td></tr>
                  </table>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
                  <p style="color:#cbd5e1;font-size:0.75rem;text-align:center;">HR Management System &bull; Confidential</p>
                </div>
                """
        }.ToMessageBody();

        await SendAsync(message, toEmail);
    }

    public async Task SendLeaveRejectedEmailAsync(
        string toEmail, string toName,
        string leaveType, string fromDate, string toDate, string reason)
    {
        var smtp = _configuration.GetSection("SmtpSettings");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(smtp["SenderName"] ?? "HR Management", smtp["User"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = $"Leave Request Rejected — {leaveType} ({fromDate} – {toDate})";

        message.Body = new BodyBuilder
        {
            HtmlBody = $"""
                <div style="font-family:Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                  <h1 style="color:#1565C0;margin:0 0 24px;">HR Management</h1>
                  <h2 style="color:#dc2626;">Leave Request Rejected</h2>
                  <p style="color:#475569;">Hi <strong>{toName}</strong>,</p>
                  <p style="color:#475569;">Unfortunately, your leave request has been <strong style="color:#dc2626;">rejected</strong>.</p>
                  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
                    <tr><td style="padding:8px;font-weight:600;color:#1e293b;">Leave Type</td><td style="padding:8px;color:#475569;">{leaveType}</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px;font-weight:600;color:#1e293b;">From</td><td style="padding:8px;color:#475569;">{fromDate}</td></tr>
                    <tr><td style="padding:8px;font-weight:600;color:#1e293b;">To</td><td style="padding:8px;color:#475569;">{toDate}</td></tr>
                    <tr style="background:#f8fafc;"><td style="padding:8px;font-weight:600;color:#1e293b;">Reason</td><td style="padding:8px;color:#475569;">{reason}</td></tr>
                  </table>
                  <p style="color:#475569;">If you have questions, please contact your manager or HR department.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
                  <p style="color:#cbd5e1;font-size:0.75rem;text-align:center;">HR Management System &bull; Confidential</p>
                </div>
                """
        }.ToMessageBody();

        await SendAsync(message, toEmail);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string toName, string tempPassword, string jobTitle)
    {
        var smtp = _configuration.GetSection("SmtpSettings");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(smtp["SenderName"] ?? "HR Management", smtp["User"]));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Welcome to the Team — Your HR Portal Access";

        message.Body = new BodyBuilder
        {
            HtmlBody = $"""
                <div style="font-family:Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px;">
                  <h1 style="color:#1565C0;margin:0 0 24px;">HR Management</h1>
                  <h2 style="color:#16a34a;">Welcome aboard, {toName}! 🎉</h2>
                  <p style="color:#475569;">Congratulations! You have been hired as <strong>{jobTitle}</strong>.</p>
                  <p style="color:#475569;">Your employee account has been created. Here are your login credentials:</p>
                  <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#f8fafc;border-radius:8px;">
                    <tr><td style="padding:12px 16px;font-weight:600;color:#1e293b;">Email</td><td style="padding:12px 16px;color:#475569;">{toEmail}</td></tr>
                    <tr><td style="padding:12px 16px;font-weight:600;color:#1e293b;">Temp Password</td><td style="padding:12px 16px;color:#475569;font-family:monospace;font-size:1.1em;">{tempPassword}</td></tr>
                  </table>
                  <p style="color:#dc2626;font-weight:600;">Please log in and change your password immediately.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"/>
                  <p style="color:#cbd5e1;font-size:0.75rem;text-align:center;">HR Management System &bull; Confidential</p>
                </div>
                """
        }.ToMessageBody();

        await SendAsync(message, toEmail);
    }

    private async Task SendAsync(MimeMessage message, string toEmail)
    {
        var smtp = _configuration.GetSection("SmtpSettings");
        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(smtp["Host"], int.Parse(smtp["Port"] ?? "587"), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtp["User"], smtp["Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            _logger.LogInformation("Email sent to {Email}: {Subject}", toEmail, message.Subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}: {Subject}", toEmail, message.Subject);
            throw;
        }
    }
}
