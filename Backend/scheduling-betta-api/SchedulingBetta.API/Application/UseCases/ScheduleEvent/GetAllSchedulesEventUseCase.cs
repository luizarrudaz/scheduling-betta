using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class GetAllSchedulesEventUseCase : IGetAllSchedulesEventUseCase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILogger<GetAllSchedulesEventUseCase> _logger;

        public GetAllSchedulesEventUseCase(IEventRepository eventRepository, ILogger<GetAllSchedulesEventUseCase> logger)
        {
            _eventRepository = eventRepository;
            _logger = logger;
        }

        public async Task<List<EventSchedule>> Execute()
        {
            _logger.LogInformation("Fetching all event schedules");
            return await _eventRepository.GetAllSchedules();
        }
    }
}
