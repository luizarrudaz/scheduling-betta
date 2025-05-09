using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;

namespace SchedulingBetta.API.Application.UseCases;

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
            StartTime = eventEntity.StartTime,
            EndTime = eventEntity.EndTime,
            BreakWindow = eventEntity.BreakStart.HasValue && eventEntity.BreakEnd.HasValue
                ? new BreakWindowDto
                {
                    BreakStart = eventEntity.BreakStart.Value,
                    BreakEnd = eventEntity.BreakEnd.Value
                }
                : null,
            AvailableSlots = eventEntity.AvailableSlots
        };
    }
}
