using FluentValidation;
using SchedulingBetta.API.Application.DTOs.Event;

namespace SchedulingBetta.API.Application.FluentValidation;
public class CreateEventCommandValidator : AbstractValidator<CreateEventCommandDto>
{
    public CreateEventCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required.");

        RuleFor(x => x.Location)
            .NotEmpty()
            .WithMessage("Location is required.");

        RuleFor(x => x.SessionDuration)
            .GreaterThan(0)
            .WithMessage("Session duration must be positive.");

        RuleFor(x => new { x.StartTime, x.EndTime })
            .Must(x => x.StartTime < x.EndTime)
            .WithMessage("Start time must precede end time.");
    }
}
