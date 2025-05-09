using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Update.Internal;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.UseCases;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;
using System.Net;


[ApiController]
[Route("[controller]")]
public class EventController : ControllerBase
{
    private readonly ICreateEventUseCase _createEventUseCase;
    private readonly IGetAllEventsUseCase _getAllEventsUseCase;
    private readonly IGetEventByIdUseCase _getEventByIdUseCase;
    private readonly IGetEventByNameUseCase _getEventByNameUseCase;
    private readonly IUpdateEventUseCase _updateEventUseCase;
    private readonly IDeleteEventUseCase _deleteEventUseCase;
    private readonly ILogger<EventController> _logger;

    public EventController(
        ICreateEventUseCase createEventUseCase,
        IGetAllEventsUseCase getAllEventsUseCase,
        IGetEventByIdUseCase getEventByIdUseCase,
        IGetEventByNameUseCase getEventByNameUseCase,
        IUpdateEventUseCase updateEventUseCase,
        IDeleteEventUseCase deleteEventUseCase,
        ILogger<EventController> logger)
    {
        _createEventUseCase = createEventUseCase;
        _getAllEventsUseCase = getAllEventsUseCase;
        _getEventByIdUseCase = getEventByIdUseCase;
        _getEventByNameUseCase = getEventByNameUseCase;
        _updateEventUseCase = updateEventUseCase;
        _deleteEventUseCase = deleteEventUseCase;
        _logger = logger;
    }

    [HttpPost("CreateEvent")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.Created)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> CreateEvent([FromBody] EventDto command)
    {
        try
        {
            _logger.LogInformation("Creating new event with title {Title}", command.Title);

            var eventId = await _createEventUseCase.Execute(command);

            _logger.LogInformation("Event created with ID {EventId}", eventId);

            return CreatedAtAction(
                nameof(GetEventById),
                new { id = eventId },
                new { EventId = eventId });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid event creation request");
            return Problem(
                title: "Invalid request",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating event");
            return Problem(
                title: "Internal server error",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }

    [HttpGet("GetAllEvents")]
    [ProducesResponseType(typeof(GetEventDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetAllEvents()
    {
        var events = await _getAllEventsUseCase.Execute();
        if (events == null)
        {
            return NotFound();
        }

        return Ok(events);
    }

    [HttpGet("GetEventById/{id}")]
    [ProducesResponseType(typeof(GetEventDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetEventById(int id)
    {
        var @event = await _getEventByIdUseCase.Execute(id);
        if (@event == null)
        {
            return NotFound();
        }

        return Ok(@event);
    }

    [HttpGet("GetEventByName/{name}")]
    [ProducesResponseType(typeof(GetEventDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetEventByName(string name)
    {
        var @event = await _getEventByNameUseCase.Execute(name);
        if (@event == null)
        {
            return NotFound();
        }

        return Ok(@event);
    }

    [HttpPut("UpdateEvent/{id}")]
    [ProducesResponseType(typeof(GetEventDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] EventDto command)
    {
        try
        {
            _logger.LogInformation("Updating event with ID {EventId}", id);
            var existingEvent = await _getEventByIdUseCase.Execute(id);
            if (existingEvent == null)
            {
                return NotFound();
            }

            var updateEvent = await _updateEventUseCase.Execute(id, command);
            return Ok(updateEvent);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid event update request for ID {EventId}", id);
            return Problem(
                title: "Invalid request",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating event with ID {EventId}", id);
            return Problem(
                title: "Internal server error",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }

    [HttpDelete("DeleteEvent/{id}")]
    [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        try
        {
            _logger.LogInformation("Deleting event with ID {EventId}", id);

            var deleted = await _deleteEventUseCase.Execute(id);
            if (!deleted)
            {
                return NotFound(new { Message = $"Event with ID {id} not found." });
            }

            return Ok(new { Message = $"Event with ID {id} was successfully deleted." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting event with ID {EventId}", id);
            return Problem(
                title: "Internal server error",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }
}