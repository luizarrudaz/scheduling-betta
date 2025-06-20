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
            var samAccountName = User.Identity?.Name;

            if (string.IsNullOrEmpty(samAccountName))
            {
                return Unauthorized("Não foi possível identificar o usuário a partir do token.");
            }

            var scheduleEventDtoWithUserId = new ScheduleEventDtoWithUserIdDto
            {
                EventId = scheduleEventDto.EventId,
                SelectedSlot = scheduleEventDto.SelectedSlot,
                UserId = samAccountName
            };

            var result = await _scheduleEventUseCase.Execute(scheduleEventDtoWithUserId);
            return CreatedAtAction(nameof(ScheduleEvent), new { id = result.ScheduleId }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Falha ao agendar evento", Detail = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Title = "Erro interno no servidor", Detail = "Ocorreu um erro ao processar o seu pedido. Tente novamente mais tarde." });
        }
    }

    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(List<GetScheduledEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllScheduleEvents()
    {
        var entities = await _getAllSchedulesEventUseCase.Execute();
        return Ok(entities);
    }

    [Authorize]
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(List<GetScheduledEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSchedulesByUser(string userId)
    {
        var entities = await _getAllSchedulesByUserUseCase.Execute(userId);
        return Ok(entities);
    }

    [Authorize]
    [HttpDelete("{scheduleId:int}")]
    [ProducesResponseType(typeof(UnscheduleResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UnscheduleEvent(int scheduleId)
    {
        try
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Não foi possível identificar o usuário a partir do token.");
            }

            var unscheduleDto = new UnscheduleEventDtoWithUserIdDto
            {
                ScheduleId = scheduleId,
                UserId = username
            };

            var result = await _unscheduleEventUseCase.Execute(unscheduleDto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails { Title = "Acesso Negado", Detail = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Falha ao cancelar agendamento", Detail = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while unscheduling the event. ScheduleId: {ScheduleId}", scheduleId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Title = "Ocorreu um erro ao processar sua solicitação", Detail = ex.Message });
        }
    }
}