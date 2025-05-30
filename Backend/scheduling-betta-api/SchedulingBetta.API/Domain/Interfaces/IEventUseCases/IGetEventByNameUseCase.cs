using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces.EventUseCase;

public interface IGetEventByNameUseCase
{
    Task<GetEventDto?> Execute(string name);
}
