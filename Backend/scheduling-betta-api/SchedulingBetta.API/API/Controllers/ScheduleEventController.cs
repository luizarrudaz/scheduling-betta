using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchedulingBetta.API.Application.DTOs.ScheduleEvent;
using SchedulingBetta.API.Domain.Interfaces.IScheduleEventUseCases;

namespace SchedulingBetta.API.API.Controllers;
[Route("schedule-event")]
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

    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ScheduleEvent([FromBody] ScheduleEventDto scheduleEventDto)
    {
        try
        {
            var SamAccountName = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.WindowsAccountName)?.Value;

            var scheduleEventDtoWithUserId = new ScheduleEventDtoWithUserIdDto
            {
                EventId = scheduleEventDto.EventId,
                SelectedSlot = scheduleEventDto.SelectedSlot,
                UserId = SamAccountName
            };

            _logger.LogInformation("Scheduling event for user {UserId} at slot {Slot}", SamAccountName, scheduleEventDto.SelectedSlot);
            var eventId = await _scheduleEventUseCase.Execute(scheduleEventDtoWithUserId);
            _logger.LogInformation("Event scheduled with ID {EventId}", scheduleEventDto.EventId);
            return CreatedAtAction(
                nameof(ScheduleEvent),
                new { id = eventId },
                new { EventId = eventId });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to schedule event: {ErrorMessage}", ex.Message);
            return BadRequest(new ProblemDetails
            {
                Title = "Falha ao agendar evento",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while scheduling the event: {ErrorMessage}", ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Erro interno no servidor",
                Detail = "Ocorreu um erro ao processar o seu pedido. Tente novamente mais tarde."
            });
        }
    }

    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(List<GetScheduledEventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllScheduleEvents()
    {
        try
        {
            var entities = await _getAllSchedulesEventUseCase.Execute();

            var scheduleDtos = entities.Select(s => new GetScheduledEventDto
            {
                Id = s.Id,
                Event = s.Event,
                UserId = s.UserId,
                SelectedSlot = s.SelectedSlot,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();

            return Ok(scheduleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "An error occurred while fetching all schedules. ErrorMessage: {ErrorMessage}",
                ex.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Erro ao buscar agendamentos",
                Detail = ex.Message
            });

        }
    }

    [Authorize]
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(List<GetScheduledEventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSchedulesByUser(string userId)
    {
        try
        {
            var entities = await _getAllSchedulesByUserUseCase.Execute(userId);

            var scheduleDtos = entities.Select(s => new GetScheduledEventDto
            {
                Id = s.Id,
                Event = s.Event,
                UserId = s.UserId,
                SelectedSlot = s.SelectedSlot,
                Status = s.Status,
                CreatedAt = s.CreatedAt
            }).ToList();

            return Ok(scheduleDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "An error occurred while fetching schedules for user {UserId}. ErrorMessage: {ErrorMessage}",
                userId,
                ex.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Erro ao buscar agendamentos do usuário",
                Detail = ex.Message
            });

        }
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(UnscheduleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UnscheduleEvent(int id)
    {
        try
        {
            var SamAccountName = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.WindowsAccountName)?.Value;

            var unscheduleEventDtoWithUserId = new UnscheduleEventDtoWithUserIdDto
            {
                EventId = id,
                UserId = SamAccountName
            };

            _logger.LogInformation("Unscheduling event for user {UserId} from event {EventId}", SamAccountName, id);
            var result = await _unscheduleEventUseCase.Execute(unscheduleEventDtoWithUserId);
            _logger.LogInformation("User {UserId} unscheduled from event {EventId}", SamAccountName, id);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex,
                "Failed to unschedule event. ErrorMessage: {ErrorMessage}",
                ex.Message);

            return BadRequest(new ProblemDetails
            {
                Title = "Falha ao desagendar evento",
                Detail = ex.Message
            });

        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "An unexpected error occurred while unscheduling the event. ErrorMessage: {ErrorMessage}",
                ex.Message);

            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Title = "Ocorreu um erro ao processar sua solicitação",
                Detail = ex.Message
            });
        }
    }
}