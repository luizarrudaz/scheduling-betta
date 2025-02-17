using SchedulingBetta.API.DTOs;
using SchedulingBetta.API.Entitites;
using SchedulingBetta.API.Interfaces;

namespace SchedulingBetta.API.Services;

public class ScheduleService : IScheduleService
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly List<InterestedUser> _interestedUsers = [];
    private readonly List<ScheduleLog> _logs = [];

    public ScheduleService(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<IEnumerable<Schedule>> GetAllSchedules()
    {
        return await _scheduleRepository.GetAll();
    }

    public async Task<Schedule> GetScheduleById(int id)
    {
        return await _scheduleRepository.GetById(id);
    }

    public async Task<int> CreateSchedule(Schedule schedule)
    {
        var existingSchedules = await _scheduleRepository.GetByUser(schedule.UserId);
        if (existingSchedules.Any(s => s.DateTime == schedule.DateTime))
        {
            throw new InvalidOperationException("Usuário já possui um agendamento para este dia.");
        }

        var scheduleId = await _scheduleRepository.Add(schedule);

        await AddLog(new ScheduleLog
        {
            ScheduleId = scheduleId,
            Action = "Agendado",
            Timestamp = DateTime.UtcNow
        });

        return scheduleId;
    }

    public async Task<bool> UpdateSchedule(int id, UpdateScheduleDTO dto)
    {
        var schedule = await _scheduleRepository.GetById(id);
        if (schedule == null)
        {
            return false;
        }

        schedule.DateTime = dto.DateTime;
        schedule.Service = dto.Service;

        var result = await _scheduleRepository.Update(schedule);

        await AddLog(new ScheduleLog
        {
            ScheduleId = id,
            Action = "Atualizado",
            Timestamp = DateTime.UtcNow
        });

        return result;
    }

    public async Task<bool> CancelSchedule(int id)
    {
        var result = await _scheduleRepository.Cancel(id);

        await AddLog(new ScheduleLog
        {
            ScheduleId = id,
            Action = "Cancelado",
            Timestamp = DateTime.UtcNow
        });

        return result;
    }

    public async Task<IEnumerable<Schedule>> GetSchedulesByDate(DateTime date)
    {
        return await _scheduleRepository.GetByDate(date);
    }

    public async Task<IEnumerable<Schedule>> GetSchedulesByService(string service)
    {
        return await _scheduleRepository.GetByService(service);
    }

    public async Task<IEnumerable<Schedule>> GetSchedulesByUser(int userId)
    {
        return await _scheduleRepository.GetByUser(userId);
    }

    public async Task<int> AddInterestedUser(int scheduleId, int userId)
    {
        var interestedUser = new InterestedUser { ScheduleId = scheduleId, UserId = userId };
        interestedUser.Id = _interestedUsers.Count + 1;
        _interestedUsers.Add(interestedUser);
        return await Task.FromResult(interestedUser.Id);
    }

    public async Task<IEnumerable<InterestedUser>> GetInterestedUsers(int scheduleId)
    {
        return await Task.FromResult(_interestedUsers.Where(i => i.ScheduleId == scheduleId));
    }

    public async Task<bool> RemoveInterestedUser(int id)
    {
        var user = _interestedUsers.FirstOrDefault(i => i.Id == id);
        if (user == null)
        {
            return false;
        }
        _interestedUsers.Remove(user);
        return await Task.FromResult(true);
    }

    public async Task AddLog(ScheduleLog log)
    {
        log.Id = _logs.Count + 1;
        _logs.Add(log);
        await Task.CompletedTask;
    }

    public async Task<IEnumerable<ScheduleLog>> GetLogs(int scheduleId)
    {
        return await Task.FromResult(_logs.Where(l => l.ScheduleId == scheduleId));
    }
}
