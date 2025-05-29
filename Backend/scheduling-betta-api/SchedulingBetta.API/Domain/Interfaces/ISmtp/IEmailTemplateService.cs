namespace SchedulingBetta.API.Domain.Interfaces.ISmtp;

public interface IEmailTemplateService
{
    string GetTemplateContent(string templateName, Dictionary<string, string> placeholders);
}
