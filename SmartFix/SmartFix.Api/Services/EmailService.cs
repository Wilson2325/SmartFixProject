using MailKit.Net.Smtp;
using MimeKit;

namespace SmartFix.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {
            var subject = "SmartFix OTP Verification";

            var html = $@"
<div style='font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:30px'>
  <div style='max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:30px;border:1px solid #e5e7eb'>
    <h2 style='margin:0 0 16px;color:#2563eb'>SmartFix OTP Verification</h2>
    <p style='font-size:15px;color:#334155'>Use the OTP below to continue:</p>
    <div style='margin:20px 0;padding:18px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;text-align:center'>
      <span style='font-size:32px;font-weight:700;letter-spacing:6px;color:#1d4ed8'>{otp}</span>
    </div>
    <p style='font-size:14px;color:#64748b'>This OTP is valid for 5 minutes.</p>
    <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'>
    <p style='font-size:12px;color:#94a3b8'>SmartFix System</p>
  </div>
</div>";

            await SendEmailAsync(toEmail, subject, html);
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var fromName = _config["EmailSettings:FromName"] ?? "SmartFix";
            var fromEmail = _config["EmailSettings:FromEmail"];
            var smtpServer = _config["EmailSettings:SmtpServer"];
            var port = int.Parse(_config["EmailSettings:Port"] ?? "587");
            var username = _config["EmailSettings:Username"];
            var password = _config["EmailSettings:Password"];

            if (string.IsNullOrWhiteSpace(fromEmail))
                throw new Exception("EmailSettings:FromEmail missing");

            if (string.IsNullOrWhiteSpace(smtpServer))
                throw new Exception("EmailSettings:SmtpServer missing");

            if (string.IsNullOrWhiteSpace(username))
                throw new Exception("EmailSettings:Username missing");

            if (string.IsNullOrWhiteSpace(password))
                throw new Exception("EmailSettings:Password missing");

            if (string.IsNullOrWhiteSpace(toEmail))
                throw new Exception("Recipient email missing");

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(fromName, fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new TextPart("html")
            {
                Text = htmlBody
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, port, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}