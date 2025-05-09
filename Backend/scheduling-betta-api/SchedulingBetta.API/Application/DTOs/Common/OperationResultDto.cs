namespace SchedulingBetta.API.Application.DTOs.Common;

public class OperationResultDto
{
    public bool Success { get; }
    public string Message { get; }

    private OperationResultDto(bool success, string message)
    {
        Success = success;
        Message = message;
    }

    public static OperationResultDto Ok() => new(true, "");
    public static OperationResultDto Failure(string message) => new(false, message);
}
