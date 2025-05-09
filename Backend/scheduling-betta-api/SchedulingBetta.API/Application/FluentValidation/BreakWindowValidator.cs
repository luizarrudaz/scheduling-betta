using FluentValidation;
using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Application.FluentValidation;

public class BreakWindowValidator : AbstractValidator<BreakWindowDto>
{
    public BreakWindowValidator()
    {
        RuleFor(x => new { x.BreakStart, x.BreakEnd })
            .Must(x => x.BreakStart < x.BreakEnd)
            .WithMessage("Break window start time must precede end time.");
    }
}
