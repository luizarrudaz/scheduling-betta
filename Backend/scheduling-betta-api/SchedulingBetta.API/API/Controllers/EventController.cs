using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Domain.Interfaces.EventUseCase;
using System.Net;


[ApiController]
[Route("[controller]")]
public class EventController : ControllerBase
{
    private readonly ICreateEventUseCase _createEventUseCase;
    private readonly IGetAllEventsUseCase _getAllEventsUseCase;
    private readonly IGetEventByIdUseCase _getEventByIdUseCase;
    private readonly IGetEventByNameUseCase _getEventByNameUseCase;
    private readonly ILogger<EventController> _logger;

    public EventController(
        ICreateEventUseCase createEventUseCase,
        IGetAllEventsUseCase getAllEventsUseCase,
        IGetEventByIdUseCase getEventByIdUseCase,
        IGetEventByNameUseCase getEventByNameUseCase,
        ILogger<EventController> logger)
    {
        _createEventUseCase = createEventUseCase;
        _getAllEventsUseCase = getAllEventsUseCase;
        _getEventByIdUseCase = getEventByIdUseCase;
        _getEventByNameUseCase = getEventByNameUseCase;
        _logger = logger;
    }

    [HttpPost("CreateEvent")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.Created)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), (int)HttpStatusCode.InternalServerError)]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventCommandDto command)
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
}