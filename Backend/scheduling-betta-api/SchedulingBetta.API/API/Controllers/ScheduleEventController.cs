using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Application.DTOs.Event;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Entities;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;
using SchedulingBetta.API.Infrastructure.Mapper;

namespace SchedulingBetta.API.API.Controllers;
[Route("[controller]")]
[ApiController]
public class ScheduleEventController : ControllerBase
{
    private readonly IScheduleEventUseCase _scheduleEventUseCase;
    private readonly IGetAllSchedulesEventUseCase _getAllSchedulesEventUseCase;
    private readonly IGetAllSchedulesByUserUseCase _getAllSchedulesByUserUseCase;
    private readonly IUnscheduleEventUseCase _unscheduleEventUseCase;
    private readonly ILogger<ScheduleEventController> _logger;

    public ScheduleEventController(
        IScheduleEventUseCase scheduleEventUseCase,
        IGetAllSchedulesEventUseCase getAllSchedulesEventUseCase,
        IGetAllSchedulesByUserUseCase getAllSchedulesByUserUseCase,
        IUnscheduleEventUseCase unscheduleEventUseCase,
        ILogger<ScheduleEventController> logger)
    {
        _scheduleEventUseCase = scheduleEventUseCase;
        _getAllSchedulesEventUseCase = getAllSchedulesEventUseCase;
        _getAllSchedulesByUserUseCase = getAllSchedulesByUserUseCase;
        _unscheduleEventUseCase = unscheduleEventUseCase;
        _logger = logger;
    }

    [HttpPost("Schedule")]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ScheduleEvent([FromBody] ScheduleEventDto scheduleEventDto)
    {
        try
        {
            _logger.LogInformation("Scheduling event for user {UserId} at slot {Slot}", scheduleEventDto.UserId, scheduleEventDto.SelectedSlot);
            var eventId = await _scheduleEventUseCase.Execute(scheduleEventDto);
            _logger.LogInformation("Event scheduled with ID {EventId}", eventId);
            return CreatedAtAction(
                nameof(ScheduleEvent),
                new { id = eventId },
                new { EventId = eventId });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to schedule event: {Message}", ex.Message);
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while scheduling the event");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Title = "An error occurred while processing your request" });
        }
    }

    [HttpGet("GetAllSchedules")]
    [ProducesResponseType(typeof(List<ScheduleEventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllSchedules()
    {
        try
        {
            _logger.LogInformation("Fetching all event schedules");

            var entities = await _getAllSchedulesEventUseCase.Execute();

            var scheduleDtos = entities.Select(s => new ScheduleEventDto
            {
                Id = s.Id,
                EventId = s.EventId,
                Event = s.Event == null ? null : new EventDto
                {
                    Title = s.Event.Title,
                    SessionDuration = s.Event.SessionDuration,
                    Location = s.Event.Location,
                    StartTime = s.Event.StartTime,
                    EndTime = s.Event.EndTime,
                    BreakWindow = s.Event.BreakStart == null || s.Event.BreakEnd == null
                        ? null
                        : new BreakWindowDto
                        {
                            BreakStart = s.Event.BreakStart.Value,
                            BreakEnd = s.Event.BreakEnd.Value
                        },
                },
                UserId = s.UserId,
                SelectedSlot = s.ScheduleTime,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();

            return Ok(scheduleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching all schedules");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Title = "Failed to fetch schedules" });
        }
    }

    [HttpGet("GetAllSchedulesById/{userId}")]
    [ProducesResponseType(typeof(List<ScheduleEventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSchedulesByUser(string userId)
    {
        try
        {
            _logger.LogInformation("Fetching schedules for user {UserId}", userId);

            var entities = await _getAllSchedulesByUserUseCase.Execute(userId);

            var scheduleDtos = entities.Select(s => new ScheduleEventDto
            {
                Id = s.Id,
                EventId = s.EventId,
                Event = s.Event == null ? null : new EventDto
                {
                    Title = s.Event.Title,
                    SessionDuration = s.Event.SessionDuration,
                    Location = s.Event.Location,
                    StartTime = s.Event.StartTime,
                    EndTime = s.Event.EndTime,
                    BreakWindow = s.Event.BreakStart == null || s.Event.BreakEnd == null
                        ? null
                        : new BreakWindowDto
                        {
                            BreakStart = s.Event.BreakStart.Value,
                            BreakEnd = s.Event.BreakEnd.Value
                        },
                },
                UserId = s.UserId,
                SelectedSlot = s.ScheduleTime,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();

            return Ok(scheduleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching schedules for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Title = "Failed to fetch user schedules" });
        }
    }

    [HttpPost("Unschedule")]
    [ProducesResponseType(typeof(UnscheduleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UnscheduleEvent([FromBody] UnscheduleEventDto unscheduleEventDto)
    {
        try
        {
            _logger.LogInformation("Unscheduling event for user {UserId} from event {EventId}", unscheduleEventDto.UserId, unscheduleEventDto.EventId);
            var result = await _unscheduleEventUseCase.Execute(unscheduleEventDto);
            _logger.LogInformation("User {UserId} unscheduled from event {EventId}", unscheduleEventDto.UserId, unscheduleEventDto.EventId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to unschedule event: {Message}", ex.Message);
            return BadRequest(new ProblemDetails { Title = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while unscheduling the event");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Title = "An error occurred while processing your request" });
        }
    }
}
