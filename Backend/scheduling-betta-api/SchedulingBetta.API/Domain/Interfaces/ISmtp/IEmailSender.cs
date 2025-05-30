namespace SchedulingBetta.API.Domain.Interfaces.ISmtp;

public interface IEmailSender
{
    Task SendEmail(string to, string subject, string body);
}
