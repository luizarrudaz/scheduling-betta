using SchedulingBetta.API.DTOs;
using SchedulingBetta.API.Entitites;

namespace SchedulingBetta.API.Interfaces;

public interface IScheduleService
{
    Task<IEnumerable<Schedule>> GetAllSchedules();
    Task<Schedule> GetScheduleById(int id);
    Task<int> CreateSchedule(Schedule schedule);
    Task<bool> UpdateSchedule(int id, UpdateScheduleDTO dto);
    Task<bool> CancelSchedule(int id);
    Task<IEnumerable<Schedule>> GetSchedulesByDate(DateTime date);
    Task<IEnumerable<Schedule>> GetSchedulesByService(string service);
    Task<IEnumerable<Schedule>> GetSchedulesByUser(int userId);
    Task<int> AddInterestedUser(int scheduleId, int userId);
    Task<IEnumerable<InterestedUser>> GetInterestedUsers(int scheduleId);
    Task<bool> RemoveInterestedUser(int id);
    Task<IEnumerable<ScheduleLog>> GetLogs(int scheduleId);
}
