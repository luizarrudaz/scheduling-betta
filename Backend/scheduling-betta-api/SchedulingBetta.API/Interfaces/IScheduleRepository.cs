using SchedulingBetta.API.DTOs;
using SchedulingBetta.API.Entitites;

namespace SchedulingBetta.API.Interfaces;

public interface IScheduleRepository
{
    Task<IEnumerable<Schedule>> GetAll();
    Task<Schedule> GetById(int id);
    Task<int> Add(Schedule schedule);
    Task<bool> Update(Schedule schedule);
    Task<bool> Cancel(int id);
    Task<IEnumerable<Schedule>> GetByDate(DateTime date);
    Task<IEnumerable<Schedule>> GetByService(string service);
    Task<IEnumerable<Schedule>> GetByUser(int userId);
}