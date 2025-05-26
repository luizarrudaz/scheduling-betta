using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.Event;

public class GetAllEventsUseCase : IGetAllEventsUseCase
{
    private readonly IEventRepository _eventRepository;

    public GetAllEventsUseCase(IEventRepository eventRepository)
    {
        _eventRepository = eventRepository;
    }

    public async Task<List<GetEventDto?>?> Execute()
    {
        var events = await _eventRepository.GetAllEvents();
        if (events == null || events.Count == 0)
        {
            return null;
        }

        var eventDtos = events.Select(e => new GetEventDto
        {
            Id = e.Id,
            Title = e.Title,
            SessionDuration = e.SessionDuration,
            Location = e.Location,
            StartTime = DateTimeHelper.ConvertFromUtc(e.StartTime),
            EndTime = DateTimeHelper.ConvertFromUtc(e.EndTime),
            BreakWindow = e.BreakWindow != null ? new BreakWindowDto
            {
                BreakStart = e.BreakWindow.BreakStart != default
                    ? DateTimeHelper.ConvertFromUtc(e.BreakWindow.BreakStart)
                    : default,
                BreakEnd = e.BreakWindow.BreakEnd != default
                    ? DateTimeHelper.ConvertFromUtc(e.BreakWindow.BreakEnd)
                    : default
            } : null,
            AvailableSlots = e.AvailableSlots
        }).ToList();

        return eventDtos;
    }
}
