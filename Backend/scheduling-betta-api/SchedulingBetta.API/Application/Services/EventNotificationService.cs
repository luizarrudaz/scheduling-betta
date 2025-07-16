using SchedulingBetta.API.Application.DTOs.Auth;
using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Interfaces.ISmtp;
using SchedulingBetta.API.Domain.ValueObjects;

public class EventNotificationService : IEventNotificationService
{
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateService _templateService;
    private readonly string _groupEmail;

    public EventNotificationService(
        IEmailSender emailSender,
        IEmailTemplateService templateService)
    {
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        _templateService = templateService ?? throw new ArgumentNullException(nameof(templateService));
        _groupEmail = (emailSender as SmtpEmailService)?.GetGroupEmail()
            ?? throw new InvalidOperationException("GroupEmail não configurado");
    }

    private async Task SendNotification(string templateName, string subject, Event @event, string to, Dictionary<string, string> customPlaceholders = null)
    {
        var localStart = DateTimeHelper.ConvertFromUtc(@event.StartTime);
        var localEnd = DateTimeHelper.ConvertFromUtc(@event.EndTime);

        var placeholders = new Dictionary<string, string>
        {
            { "Title", @event.Title ?? "Sem título" },
            { "Start_Time", localStart.ToString("dd/MM/yyyy HH:mm") },
            { "End_Time", localEnd.ToString("dd/MM/yyyy HH:mm") },
            { "Location", @event.Location ?? "Sem localização" }
        };

        if (customPlaceholders != null)
        {
            foreach (var placeholder in customPlaceholders)
            {
                placeholders[placeholder.Key] = placeholder.Value;
            }
        }

        var body = _templateService.GetTemplateContent(templateName, placeholders);
        await _emailSender.SendEmail(to, subject, body);
    }

    public Task NotifyEventCreated(Event @event) =>
        SendNotification("EventCreated.html", $"Novo Evento: {@event.Title}", @event, _groupEmail);

    public Task NotifyEventUpdated(Event @event) =>
        SendNotification("EventUpdated.html", $"Evento Atualizado: {@event.Title}", @event, _groupEmail);

    public Task NotifyEventCancelled(Event @event) =>
        SendNotification("EventDeleted.html", $"Evento Cancelado: {@event.Title}", @event, _groupEmail);

    public Task NotifyUserScheduled(Event @event, string userEmail, DateTime selectedSlot)
    {
        var customPlaceholders = new Dictionary<string, string>
        {
            { "Selected_Slot", DateTimeHelper.ConvertFromUtc(selectedSlot).ToString("HH:mm") }
        };
        return SendNotification("UserScheduled.html", $"Agendamento Confirmado: {@event.Title}", @event, userEmail, customPlaceholders);
    }

    public Task NotifyUserCancelled(Event @event, string userEmail) =>
        SendNotification("UserCancelled.html", $"Agendamento Cancelado: {@event.Title}", @event, userEmail);

    public Task NotifyAdminCancelled(LdapUserInfoDto user, Event @event, DateTime scheduledTime)
    {
        var customPlaceholders = new Dictionary<string, string>
        {
            { "Selected_Slot", DateTimeHelper.ConvertFromUtc(scheduledTime).ToString("dd/MM/yyyy HH:mm") }
        };
        return SendNotification("AdminCancelled.html", $"Seu Agendamento foi Cancelado: {@event.Title}", @event, user.Email, customPlaceholders);
    }
}