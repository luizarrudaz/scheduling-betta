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

    public async Task<List<GetEventDto>> Execute(GetAllEventsRequestDto request)
    {
        var events = await _eventRepository.GetAllEvents(request);
        if (events == null || events.Count == 0)
        {
            return new List<GetEventDto>();
        }

        var eventDtos = events.Select(e => new GetEventDto
        {
            Id = e.Id,
            Title = e.Title,
            SessionDuration = e.SessionDuration,
            Location = e.Location,
            StartTime = DateTimeHelper.ConvertFromUtc(e.StartTime),
            EndTime = DateTimeHelper.ConvertFromUtc(e.EndTime),
            BreakWindow = e.BreakStart.HasValue && e.BreakEnd.HasValue ? new BreakWindowDto
            {
                BreakStart = DateTimeHelper.ConvertFromUtc(e.BreakStart.Value),
                BreakEnd = DateTimeHelper.ConvertFromUtc(e.BreakEnd.Value)
            } : null,
            AvailableSlots = e.AvailableSlots
        }).ToList();

        return eventDtos;
    }
}