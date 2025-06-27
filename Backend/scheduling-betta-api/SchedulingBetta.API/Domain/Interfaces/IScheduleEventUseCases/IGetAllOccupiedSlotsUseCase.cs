using SchedulingBetta.API.Application.DTOs.ScheduleEvent;

namespace SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

public interface IGetAllOccupiedSlotsUseCase
{
    Task<List<GetOccupiedSlotDto>> Execute();
}