using SchedulingBetta.API.Domain.Aggregates;
using SchedulingBetta.API.Domain.Entities;

namespace SchedulingBetta.API.Infraestructure.Mapper;

public static class EventMapper
{
    public static EventEntity ToEntity(Event domain)
    {
        return new EventEntity
        {
            Id = domain.Id,
            PublicId = domain.PublicId,
            Title = domain.Title!,
            SessionDuration = domain.SessionDuration,
            HasBreak = domain.HasBreak,
            BreakStart = domain.BreakWindow?.Start,
            BreakEnd = domain.BreakWindow?.End,
            Location = domain.Location!,
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
        var domain = Event.Create(
            entity.Title!,
            TimeSpan.FromMinutes(entity.SessionDuration),
            entity.Location!,
            entity.StartTime,
            entity.EndTime,
            entity.AvailableSlots
        );

        domain.SetId(entity.Id);
        domain.SetPublicId(entity.PublicId);

        if (entity.InterestedUsers != null)
        {
            foreach (var user in entity.InterestedUsers)
            {
                if (!string.IsNullOrEmpty(user.UserId))
                {
                    domain.AddInterestedUser(new InterestedUser(int.Parse(user.UserId), user.CreatedAt));
                }
            }
        }

        return domain;
    }
}
