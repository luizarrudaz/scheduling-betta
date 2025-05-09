using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;

namespace SchedulingBetta.API.Application.UseCases;

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

        return events;
    }
}
