using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces.EventUseCase;

public interface IGetEventByIdUseCase
{
    Task<GetEventDto?> Execute(int id);
}
