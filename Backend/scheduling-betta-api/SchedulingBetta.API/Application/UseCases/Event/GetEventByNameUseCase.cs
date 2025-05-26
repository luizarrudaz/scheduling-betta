using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.Event;

public class GetEventByNameUseCase : IGetEventByNameUseCase
{
    private readonly IEventRepository _eventRepository;
    public GetEventByNameUseCase(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }
    public async Task<GetEventDto?> Execute(string name)
    {
        var eventEntity = await _eventRepository.GetEventByName(name);
        if (eventEntity == null)
        {
            return null;
        }

        return new GetEventDto
        {
            Id = eventEntity.Id,
            Title = eventEntity.Title,
            SessionDuration = eventEntity.SessionDuration,
            Location = eventEntity.Location,
            StartTime = DateTimeHelper.ConvertFromUtc(eventEntity.StartTime),
            EndTime = DateTimeHelper.ConvertFromUtc(eventEntity.EndTime),
            BreakWindow = eventEntity.BreakStart.HasValue && eventEntity.BreakEnd.HasValue
                ? new BreakWindowDto
                {
                    BreakStart = DateTimeHelper.ConvertFromUtc(eventEntity.BreakStart.Value),
                    BreakEnd = DateTimeHelper.ConvertFromUtc(eventEntity.BreakEnd.Value)
                }
                : null,
            AvailableSlots = eventEntity.AvailableSlots
        };
    }
}
