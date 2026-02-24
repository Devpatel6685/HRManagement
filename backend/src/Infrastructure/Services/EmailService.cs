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
}
