using System.Net.Mail;
using System.Net;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;

public class SmtpEmailService : IEmailSender
{
    private readonly SmtpClient _smtpClient;
    private readonly string _from;
    private readonly string _groupEmail;

    public SmtpEmailService()
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST")
            ?? throw new InvalidOperationException("SMTP_HOST não configurado");

        var portStr = Environment.GetEnvironmentVariable("SMTP_PORT")
            ?? throw new InvalidOperationException("SMTP_PORT não configurado");
        if (!int.TryParse(portStr, out int port))
            throw new InvalidOperationException("SMTP_PORT inválido");

        var username = Environment.GetEnvironmentVariable("SMTP_USERNAME")
            ?? throw new InvalidOperationException("SMTP_USERNAME não configurado");

        var password = Environment.GetEnvironmentVariable("SMTP_PASSWORD")
            ?? throw new InvalidOperationException("SMTP_PASSWORD não configurado");

        _from = Environment.GetEnvironmentVariable("SMTP_FROM")
            ?? throw new InvalidOperationException("SMTP_FROM não configurado");

        _groupEmail = Environment.GetEnvironmentVariable("SMTP_GROUP_EMAIL")
            ?? throw new InvalidOperationException("SMTP_GROUP_EMAIL não configurado");

        var enableSslStr = Environment.GetEnvironmentVariable("SMTP_ENABLE_SSL") ?? "true";
        if (!bool.TryParse(enableSslStr, out bool enableSsl))
            enableSsl = true;

        _smtpClient = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = enableSsl
        };
    }

    public async Task SendEmail(string to, string subject, string body)
    {
        var mail = new MailMessage(_from, to, subject, body)
        {
            IsBodyHtml = true
        };

        await _smtpClient.SendMailAsync(mail);
    }

    public string GetGroupEmail() => _groupEmail;
}
