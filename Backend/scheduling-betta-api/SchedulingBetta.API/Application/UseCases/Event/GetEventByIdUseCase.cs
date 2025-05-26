using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.ValueObjects;

public class GetEventByIdUseCase : IGetEventByIdUseCase
{
    private readonly IEventRepository _eventRepository;

    public GetEventByIdUseCase(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<GetEventDto?> Execute(int id)
    {
        var eventEntity = await _eventRepository.GetEventById(id);
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
