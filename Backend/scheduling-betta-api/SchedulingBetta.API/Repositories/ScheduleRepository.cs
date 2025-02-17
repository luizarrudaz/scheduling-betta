using SchedulingBetta.API.DTOs;
using SchedulingBetta.API.Entitites;
using SchedulingBetta.API.Interfaces;

namespace SchedulingBetta.API.Repositories;

public class ScheduleRepository : IScheduleRepository
{
    private readonly List<Schedule> _schedules = [];

    public async Task<IEnumerable<Schedule>> GetAll()
    {
        return await Task.FromResult(_schedules);
    }

    public async Task<Schedule> GetById(int id)
    {
        var schedule = _schedules.FirstOrDefault(s => s.Id == id);
        if (schedule == null)
        {
            throw new KeyNotFoundException("Scheduled not found.");
        }
        return await Task.FromResult(schedule);
    }

    public async Task<int> Add(Schedule schedule)
    {
        schedule.Id = _schedules.Count + 1;
        _schedules.Add(schedule);
        return await Task.FromResult(schedule.Id);
    }

    public async Task<bool> Update(Schedule schedule)
    {
        var existingSchedule = _schedules.FirstOrDefault(s => s.Id == schedule.Id);
        if (existingSchedule == null)
        {
            return false;
        }

        existingSchedule.DateTime = schedule.DateTime;
        existingSchedule.Service = schedule.Service;
        existingSchedule.Canceled = schedule.Canceled;
        return await Task.FromResult(true);
    }

    public async Task<bool> Cancel(int id)
    {
        var schedule = _schedules.FirstOrDefault(s => s.Id == id);
        if (schedule == null)
        {
            return false;
        }

        schedule.Canceled = true;
        return await Task.FromResult(true);
    }

    public async Task<IEnumerable<Schedule>> GetByDate(DateTime date)
    {
        return await Task.FromResult(_schedules.Where(s => s.DateTime == date.Date));
    }

    public async Task<IEnumerable<Schedule>> GetByService(string service)
    {
        return await Task.FromResult(_schedules.Where(s => s.Service == service));
    }

    public async Task<IEnumerable<Schedule>> GetByUser(int userId)
    {
        return await Task.FromResult(_schedules.Where(s => s.UserId == userId));
    }
}