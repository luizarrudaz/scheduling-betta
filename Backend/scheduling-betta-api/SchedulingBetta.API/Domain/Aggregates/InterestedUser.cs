namespace SchedulingBetta.API.Domain.Aggregates;

public class InterestedUser
{
    public int UserId { get; }
    public DateTime CreatedAt { get; }

    public InterestedUser(int userId, DateTime createdAt)
    {
        UserId = userId;
        CreatedAt = createdAt;
    }
}
