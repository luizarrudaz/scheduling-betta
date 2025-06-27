using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Domain.ValueObjects;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent;

public class GetAllOccupiedSlotsUseCase : IGetAllOccupiedSlotsUseCase
{
    private readonly IEventRepository _eventRepository;
    private readonly ILogger<GetAllOccupiedSlotsUseCase> _logger;

    public GetAllOccupiedSlotsUseCase(IEventRepository eventRepository, ILogger<GetAllOccupiedSlotsUseCase> logger)
    {
        _eventRepository = eventRepository;
        _logger = logger;
    }

    public async Task<List<GetOccupiedSlotDto>> Execute()
    {
        _logger.LogInformation("Fetching all occupied slots (lightweight)");
        var schedules = await _eventRepository.GetAllSchedules();

        var result = schedules.Select(s => new GetOccupiedSlotDto
        {
            ScheduleId = s.Id,
            EventId = s.EventId,
            ScheduleTime = DateTimeHelper.ConvertFromUtc(s.ScheduleTime),
            UserId = s.UserId
        }).ToList();

        return result;
    }
}
