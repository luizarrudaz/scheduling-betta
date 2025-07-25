using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.ValueObjects;

public class GetEventByIdUseCase : IGetEventByIdUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly ILogger<GetEventByIdUseCase> _logger;

    public GetEventByIdUseCase(IEventRepository eventRepository, ILogger<GetEventByIdUseCase> logger)
    {
        _eventRepository = eventRepository;
        _logger = logger;
    }

    public async Task<GetEventDto?> Execute(int id)
    {
        _logger.LogInformation("GetEventByIdUseCase|Execute :: Buscando evento pelo ID {EventId}", id);
        var eventEntity = await _eventRepository.GetEventById(id);
        if (eventEntity == null)
        {
            _logger.LogWarning("GetEventByIdUseCase|Execute :: Evento com ID {EventId} não encontrado.", id);
            return null;
        }

        _logger.LogInformation("GetEventByIdUseCase|Execute :: Evento com ID {EventId} encontrado com sucesso.", id);
        return new GetEventDto
        {
            Id = eventEntity.Id,
            Title = eventEntity.Title,
            SessionDuration = eventEntity.SessionDuration,
            Location = eventEntity.Location,
            StartTime = DateTimeHelper.ConvertFromUtc(eventEntity.StartTime),
            EndTime = DateTimeHelper.ConvertFromUtc(eventEntity.EndTime),
            BreakWindow = eventEntity.HasBreak
                    ? new BreakWindowDto
                    {
                        BreakStart = DateTimeHelper.ConvertFromUtc(eventEntity.BreakWindow!.Start),
                        BreakEnd = DateTimeHelper.ConvertFromUtc(eventEntity.BreakWindow!.End)
                    }
                    : null,
            AvailableSlots = eventEntity.AvailableSlots
        };
    }
}