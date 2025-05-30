using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces.IEventUseCases;

public interface IUpdateEventUseCase
{
    Task<UpdateEventDto?> Execute(int id, EventDto command);
}
