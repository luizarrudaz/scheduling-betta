using SchedulingBetta.API.Domain.Exceptions;

namespace SchedulingBetta.API.Domain.ValueObjects;

public record BreakWindow(DateTime Start, DateTime End)
{
    public static BreakWindow Create(DateTime start, DateTime end)
    {
        if (start >= end)
            throw new DomainException("Horário do break inválido");

        return new BreakWindow(start, end);
    }
}
