using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Infrastructure.Mapper;

public static class EventMapper
{
    public static EventEntity ToEntity(Event domain)
    {
        return new EventEntity
        {
            Id = domain.Id,
            Title = domain.Title,
            SessionDuration = domain.SessionDuration,
            HasBreak = domain.HasBreak,
            BreakStart = domain.BreakWindow?.Start,
            BreakEnd = domain.BreakWindow?.End,
            Location = domain.Location,
            StartTime = domain.StartTime,
            EndTime = domain.EndTime,
            AvailableSlots = domain.AvailableSlots,
            CreatedAt = domain.CreatedAt,
            InterestedUsers = domain.InterestedUsers.Select(i => new InterestedUserEntity
            {
                Id = i.UserId,
                CreatedAt = i.CreatedAt
            }).ToList()
        };
    }

    public static Event ToDomain(EventEntity entity)
    {
        if (string.IsNullOrEmpty(entity.Title))
            throw new ArgumentNullException(nameof(entity.Title), "Event title cannot be null");

        if (string.IsNullOrEmpty(entity.Location))
            throw new ArgumentNullException(nameof(entity.Location), "Event location cannot be null");

        var domain = Event.Create(
            entity.Title,
            TimeSpan.FromMinutes(entity.SessionDuration),
            entity.Location,
            entity.StartTime,
            entity.EndTime,
            entity.AvailableSlots
        );

        domain.SetId(entity.Id);
        domain.SetCreatedAt(entity.CreatedAt);

        if (entity.HasBreak && entity.BreakStart.HasValue && entity.BreakEnd.HasValue)
        {
            var breakStart = entity.BreakStart.Value;
            var breakEnd = entity.BreakEnd.Value;

            if (breakStart >= breakEnd)
                throw new InvalidDataException("Invalid break window in database");

            domain.AddBreakWindow(breakStart, breakEnd);
        }

        if (entity.InterestedUsers != null)
        {
            foreach (var user in entity.InterestedUsers)
            {
                domain.AddInterestedUser(new InterestedUser(user.Id, user.CreatedAt));
            }
        }

        return domain;
    }
}