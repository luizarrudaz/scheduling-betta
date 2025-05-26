using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Domain.Interfaces.EventUseCase;

public interface ICreateEventUseCase
{
    Task<int> Execute(EventDto command);
}