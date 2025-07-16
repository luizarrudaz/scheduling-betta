using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces.EventUseCase;

public interface IGetAllEventsUseCase
{
    Task<List<GetEventDto>> Execute(GetAllEventsRequestDto request);
}