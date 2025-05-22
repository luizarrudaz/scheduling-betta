    using SchedulingBetta.API.Domain.Entities;
    using SchedulingBetta.API.Domain.Interfaces;
    using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

    namespace SchedulingBetta.API.Application.UseCases.ScheduleEvent
    {
        public class GetAllSchedulesByUserUseCase : IGetAllSchedulesByUserUseCase
        {
            private readonly IEventRepository _eventRepository;
            private readonly ILogger<GetAllSchedulesByUserUseCase> _logger;

            public GetAllSchedulesByUserUseCase(IEventRepository eventRepository, ILogger<GetAllSchedulesByUserUseCase> logger)
            {
                _eventRepository = eventRepository;
                _logger = logger;
            }

            public async Task<List<EventSchedule>> Execute(string userId)
            {
                _logger.LogInformation("Fetching event schedules for user {UserId}", userId);
                return await _eventRepository.GetAllSchedulesByUser(userId);
            }
        }
    }
