using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using SchedulingBetta.API.Domain.Interfaces.IEventUseCases;
using System.Net;

[ApiController]
[Route("event")]
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

    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(int), (int)HttpStatusCode.Created)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> CreateEvent([FromBody] EventDto command)
    {
        if (command == null)
        {
            return BadRequest(new { Message = "Event data is required." });
        }

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
            _logger.LogWarning(ex,
                "Invalid event creation request. Title: {Title}, StartTime: {StartTime:O}, ErrorMessage: {ErrorMessage}",
                command.Title ?? "NULL",
                command.StartTime,
                ex.Message);

            return Problem(
                title: "Invalid request",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error creating event. Title: {Title}, StartTime: {StartTime:O}, EndTime: {EndTime:O}, ErrorMessage: {ErrorMessage}",
                command.Title ?? "NULL",
                command.StartTime,
                command.EndTime,
                ex.Message);

            return Problem(
                title: "Internal server error",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }

    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<GetEventDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetAllEvents()
    {
        var events = await _getAllEventsUseCase.Execute();
        return Ok(events ?? []);
    }

    [Authorize]
    [HttpGet("{id:int}")]
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

    [Authorize]
    [HttpGet("by-name")]
    [ProducesResponseType(typeof(GetEventDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetEventByName([FromQuery] string name)
    {
        var @event = await _getEventByNameUseCase.Execute(name);
        if (@event == null)
        {
            return NotFound();
        }

        return Ok(@event);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(GetEventDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] EventDto command)
    {
        try
        {
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
            _logger.LogWarning(ex,
                "Invalid event update request. EventId: {EventId}, Title: {Title}, StartTime: {StartTime:O}, ErrorMessage: {ErrorMessage}",
                id,
                command.Title ?? "NULL",
                command.StartTime,
                ex.Message);

            return Problem(
                title: "Invalid request",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error updating event. EventId: {EventId}, Title: {Title}, StartTime: {StartTime:O}, EndTime: {EndTime:O}, ErrorMessage: {ErrorMessage}",
                id,
                command.Title ?? "NULL",
                command.StartTime,
                command.EndTime,
                ex.Message);

            return Problem(
                title: "Internal server error",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        try
        {
            var deleted = await _deleteEventUseCase.Execute(id);
            if (!deleted)
            {
                return NotFound(new { Message = $"Event with ID {id} not found." });
            }

            return Ok(new { Message = $"Event with ID {id} was successfully deleted." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error deleting event. EventId: {EventId}, ErrorMessage: {ErrorMessage}",
                id,
                ex.Message);

            return Problem(
                title: "Internal server error",
                detail: ex.Message,
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }
}
