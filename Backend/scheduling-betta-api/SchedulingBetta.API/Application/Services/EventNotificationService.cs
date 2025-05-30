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

    private async Task SendNotification(string templateName, string subject, Event @event, string to, DateTime? selectedSlot = null)
    {
        var localStart = DateTimeHelper.ConvertFromUtc(@event.StartTime);
        var localEnd = DateTimeHelper.ConvertFromUtc(@event.EndTime);

        string? slot = null;
        if (selectedSlot.HasValue)
        {
            slot = DateTimeHelper.ConvertFromUtc(selectedSlot.Value).ToString("HH:mm");
        }

        var placeholders = new Dictionary<string, string>
    {
        { "Title", @event.Title ?? "Sem título" },
        { "Start_Time", localStart.ToString("dd/MM/yyyy HH:mm") },
        { "End_Time", localEnd.ToString("dd/MM/yyyy HH:mm") }
    };

        if (!string.IsNullOrEmpty(slot))
        {
            placeholders.Add("Selected_Slot", slot);
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

    public Task NotifyUserScheduled(Event @event, string userEmail, DateTime selectedSlot) =>
        SendNotification("UserScheduled.html", $"Agendamento Confirmado: {@event.Title}", @event, userEmail, selectedSlot);

    public Task NotifyUserCancelled(Event @event, string userEmail) =>
        SendNotification("UserCancelled.html", $"Agendamento Cancelado: {@event.Title}", @event, userEmail);
}