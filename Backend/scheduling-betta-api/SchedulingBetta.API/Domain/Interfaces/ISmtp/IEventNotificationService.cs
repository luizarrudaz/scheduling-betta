using SchedulingBetta.API.Domain.Aggregates;

namespace SchedulingBetta.API.Domain.Interfaces.ISmtp;

public interface IEventNotificationService
{
    Task NotifyEventCreated(Event @event);
    Task NotifyEventUpdated(Event @event);
    Task NotifyEventCancelled(Event @event);
    Task NotifyUserScheduled(Event @event, string userEmail, string selectedSlot);
    Task NotifyUserCancelled(Event @event, string userEmail);
}
