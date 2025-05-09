using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces;

public interface IEventRepository
{
    Task<List<GetEventDto>> GetAllEvents();
    Task<EventEntity?> GetEventById(int id, CancellationToken cancellationToken = default);
    Task<EventEntity?> GetEventByName(string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<EventEntity>> GetEventByDateRange(DateTime start, DateTime end, CancellationToken cancellationToken = default);
    Task<bool> EventExists(int id, CancellationToken cancellationToken = default);
    Task<int> GetAvailableSlots(int eventId, CancellationToken cancellationToken = default);
    Task<bool> HasUserScheduledEvent(int eventId, string userId, CancellationToken cancellationToken = default);
    Task<InterestedUserEntity?> GetNextInterestedUser(int eventId, CancellationToken cancellationToken = default);
    Task<int> GetWaitlistCount(int eventId, CancellationToken cancellationToken = default);
    Task<bool> IsUserInWaitlist(int eventId, string userId, CancellationToken cancellationToken = default);
    Task AddEvent(Event @event, CancellationToken cancellationToken = default);
    Task AddEventRange(IEnumerable<EventEntity> events, CancellationToken cancellationToken = default);
    Task UpdateEvent(EventEntity @event, CancellationToken cancellationToken = default);
    Task DeleteEvent(EventEntity @event, CancellationToken cancellationToken = default);
    Task AddInterestedUser(InterestedUserEntity @user, CancellationToken cancellationToken = default);
    Task RemoveInterestedUser(InterestedUserEntity @user, CancellationToken cancellationToken = default);
}