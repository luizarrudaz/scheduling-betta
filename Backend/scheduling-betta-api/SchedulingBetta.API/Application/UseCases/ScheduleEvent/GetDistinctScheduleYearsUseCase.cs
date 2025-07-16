using SchedulingBetta.API.Domain.Interfaces;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
{
    public class GetDistinctScheduleYearsUseCase : IGetDistinctScheduleYearsUseCase
    {
        private readonly IEventRepository _eventRepository;

        public GetDistinctScheduleYearsUseCase(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<List<int>> Execute()
        {
            return await _eventRepository.GetDistinctScheduleYears();
        }
    }
}