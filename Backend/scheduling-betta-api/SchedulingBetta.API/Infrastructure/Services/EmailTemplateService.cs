using SchedulingBetta.API.Domain.Interfaces.ISmtp;

namespace SchedulingBetta.API.Infrastructure.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly string _templateDirectory = @"C:\Users\luiz.arruda\Desktop\scheduling-betta\Backend\scheduling-betta-api\SchedulingBetta.API\Infrastructure\EmailTemplates\";

    public string GetTemplateContent(string templateName, Dictionary<string, string> placeholders)
    {
        var templatePath = Path.Combine(_templateDirectory, templateName);
        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"Template {templateName} não encontrado em {_templateDirectory}");

        var content = File.ReadAllText(templatePath);

        foreach (var placeholder in placeholders)
        {
            content = content.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
        }

        return content;
    }
}

