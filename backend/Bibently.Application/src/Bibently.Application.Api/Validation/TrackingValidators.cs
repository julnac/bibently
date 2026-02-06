// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="TrackingValidators.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Validation;

using Bibently.Application.Abstractions.Models;
using FluentValidation;

/// <summary>
/// Validator for TrackingEvent model.
/// </summary>
public class TrackingEventValidator : AbstractValidator<TrackingEvent>
{
    private static readonly HashSet<string> ValidActions = new(StringComparer.OrdinalIgnoreCase)
    {
        "PageView", "Click", "Scroll", "FormSubmit", "Search", "Purchase",
        "AddToCart", "RemoveFromCart", "Favorite", "Share", "Download",
        "VideoPlay", "VideoComplete", "EventView", "TicketView", "TestClick"
    };

    public TrackingEventValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tracking event ID is required.");

        RuleFor(x => x.Action)
            .NotEmpty().WithMessage("Action is required.")
            .MaximumLength(50).WithMessage("Action cannot exceed 50 characters.")
            .Must(a => ValidActions.Contains(a))
            .WithMessage($"Action must be one of: {string.Join(", ", ValidActions)}");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.Payload)
            .MaximumLength(10000).WithMessage("Payload cannot exceed 10000 characters.");

        RuleFor(x => x.UserAgent)
            .MaximumLength(500).WithMessage("UserAgent cannot exceed 500 characters.");

        RuleFor(x => x.UserLocation)
            .MaximumLength(200).WithMessage("UserLocation cannot exceed 200 characters.");

        RuleFor(x => x.FrontendVersion)
            .MaximumLength(50).WithMessage("FrontendVersion cannot exceed 50 characters.");

        RuleFor(x => x.CreatedAt)
            .NotEmpty().WithMessage("CreatedAt is required.");
    }
}
