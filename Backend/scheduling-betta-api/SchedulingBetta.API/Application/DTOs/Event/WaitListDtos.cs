namespace SchedulingBetta.API.Application.DTOs.Event;

//public record WaitListAddResult(
//    bool? AlreadyInList,
//    bool Success,
//    int? Position,
//    string? FailureReason)
//{
//    public static WaitListAddResult SuccessResult(int position)
//        => new(false, true, position, null);

//    public static WaitListAddResult AlreadyExists()
//        => new(true, false, null, "User is already in the waitlist.");

//    public static WaitListAddResult MaxCapacityReached()
//        => new(false, false, null, "Waitlist is full (max 4 users).");

//    public static WaitListAddResult SlotAvailable()
//        => new(false, false, null, "Slot available - no need for waitlist.");

//    public static WaitListAddResult Error(string message)
//        => new(false, false, null, message);
//}

//public record WaitListProcessResult(
//    bool SlotAssigned,
//    string? AssignedUserId,
//    string? NextUserId,
//    string? ErrorMessage)
//{
//    public static WaitListProcessResult Success(string assignedUserId, string? nextUserId)
//        => new(true, assignedUserId, nextUserId, null);

//    public static WaitListProcessResult NoUsers()
//        => new(false, null, null, null);

//    public static WaitListProcessResult EventNotFound()
//        => new(false, null, null, "Event not found.");

//    public static WaitListProcessResult Error(string message)
//        => new(false, null, null, message);
//}

//public class WaitListPositionInfo
//{
//    public int Position { get; }
//    public int TotalUsers { get; }

//    public WaitListPositionInfo(int position, int totalUsers)
//    {
//        Position = position;
//        TotalUsers = totalUsers;
//    }
//}

//public class AddToWaitlistRequest
//{
//    public int EventId { get; set; }
//    public string? UserId { get; set; }
//}