using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class GetDistinctScheduleYearsUseCase : IGetDistinctScheduleYearsUseCase
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILogger<GetDistinctScheduleYearsUseCase> _logger;

        public GetDistinctScheduleYearsUseCase(IEventRepository eventRepository, ILogger<GetDistinctScheduleYearsUseCase> logger)
        {
            _eventRepository = eventRepository;
            _logger = logger;
        }

        public async Task<List<int>> Execute()
        {
            _logger.LogInformation("GetDistinctScheduleYearsUseCase|Execute :: Buscando anos distintos de agendamentos.");
            var years = await _eventRepository.GetDistinctScheduleYears();
            _logger.LogInformation("GetDistinctScheduleYearsUseCase|Execute :: {Count} anos distintos encontrados.", years.Count);
            return years;
        }
    }
}