// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="EventValidators.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Validation;

using Bibently.Application.Abstractions.Models;
using FluentValidation;

/// <summary>
/// Validator for Address model.
/// </summary>
public class AddressValidator : AbstractValidator<Address>
{
    public AddressValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Address type is required.")
            .MaximumLength(50).WithMessage("Address type cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Address name is required.")
            .MaximumLength(200).WithMessage("Address name cannot exceed 200 characters.");

        RuleFor(x => x.Street)
            .MaximumLength(300).WithMessage("Street cannot exceed 300 characters.")
            .When(x => !string.IsNullOrEmpty(x.Street));

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City cannot exceed 100 characters.");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required.")
            .MaximumLength(100).WithMessage("Country cannot exceed 100 characters.");

        RuleFor(x => x.PostalCode)
            .MaximumLength(20).WithMessage("Postal code cannot exceed 20 characters.")
            .When(x => !string.IsNullOrEmpty(x.PostalCode));

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90 degrees.")
            .When(x => x.Latitude.HasValue);

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180 degrees.")
            .When(x => x.Longitude.HasValue);
    }
}

/// <summary>
/// Validator for Location model.
/// </summary>
public class LocationValidator : AbstractValidator<Location>
{
    public LocationValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Location type is required.")
            .MaximumLength(50).WithMessage("Location type cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Location name is required.")
            .MaximumLength(200).WithMessage("Location name cannot exceed 200 characters.");

        RuleFor(x => x.Address)
            .NotNull().WithMessage("Location address is required.")
            .SetValidator(new AddressValidator());
    }
}

/// <summary>
/// Validator for Organization model.
/// </summary>
public class OrganizationValidator : AbstractValidator<Organization>
{
    public OrganizationValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Organization type is required.")
            .MaximumLength(50).WithMessage("Organization type cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Organization name is required.")
            .MaximumLength(200).WithMessage("Organization name cannot exceed 200 characters.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("Organization URL is required.")
            .MaximumLength(2000).WithMessage("Organization URL cannot exceed 2000 characters.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Organization URL must be a valid absolute URL.");

        RuleFor(x => x.Address)
            .NotNull().WithMessage("Organization address is required.")
            .SetValidator(new AddressValidator());
    }
}

/// <summary>
/// Validator for Offer model.
/// </summary>
public class OfferValidator : AbstractValidator<Offer>
{
    public OfferValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Offer type is required.")
            .MaximumLength(50).WithMessage("Offer type cannot exceed 50 characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price cannot be negative.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .Length(3).WithMessage("Currency must be a 3-character ISO code (e.g., PLN, EUR, USD).");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("Offer URL is required.")
            .MaximumLength(2000).WithMessage("Offer URL cannot exceed 2000 characters.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Offer URL must be a valid absolute URL.");
    }
}

/// <summary>
/// Validator for EventEntity model (used for responses and internal operations).
/// </summary>
public class EventEntityValidator : AbstractValidator<EventEntity>
{
    private static readonly HashSet<string> ValidEventCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "Event", "MusicEvent", "TheaterEvent", "SportsEvent", "BusinessEvent",
        "EducationEvent", "ExhibitionEvent", "Festival", "SocialEvent", "DanceEvent",
        "ComedyEvent", "ChildrensEvent", "LiteraryEvent", "ScreeningEvent", "FoodEvent"
    };

    private static readonly HashSet<string> ValidEventStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "EventScheduled", "EventCancelled", "EventPostponed", "EventRescheduled", "EventMovedOnline"
    };

    private static readonly HashSet<string> ValidAttendanceModes = new(StringComparer.OrdinalIgnoreCase)
    {
        "OfflineEventAttendanceMode", "OnlineEventAttendanceMode", "MixedEventAttendanceMode"
    };

    public EventEntityValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Event ID is required.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Event type is required.")
            .Must(t => ValidEventCategories.Contains(t))
            .WithMessage($"Event type must be one of: {string.Join(", ", ValidEventCategories)}");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Event name is required.")
            .MaximumLength(300).WithMessage("Event name cannot exceed 300 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Event description is required.")
            .MaximumLength(10000).WithMessage("Event description cannot exceed 10000 characters.");

        RuleFor(x => x.ArticleBody)
            .MaximumLength(50000).WithMessage("Article body cannot exceed 50000 characters.")
            .When(x => !string.IsNullOrEmpty(x.ArticleBody));

        RuleFor(x => x.Keywords)
            .Must(k => k == null || k.Count <= 50)
            .WithMessage("Cannot have more than 50 keywords.");

        RuleForEach(x => x.Keywords)
            .MaximumLength(100).WithMessage("Each keyword cannot exceed 100 characters.")
            .When(x => x.Keywords != null && x.Keywords.Count != 0);

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End date must be after or equal to start date.")
            .When(x => x.EndDate.HasValue);

        RuleFor(x => x.DatePublished)
            .NotEmpty().WithMessage("Date published is required.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("Event URL is required.")
            .MaximumLength(2000).WithMessage("Event URL cannot exceed 2000 characters.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Event URL must be a valid absolute URL.");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(2000).WithMessage("Image URL cannot exceed 2000 characters.")
            .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Image URL must be a valid absolute URL.")
            .When(x => !string.IsNullOrEmpty(x.ImageUrl));

        RuleFor(x => x.EventStatus)
            .NotEmpty().WithMessage("Event status is required.")
            .Must(s => ValidEventStatuses.Contains(s))
            .WithMessage($"Event status must be one of: {string.Join(", ", ValidEventStatuses)}");

        RuleFor(x => x.AttendanceMode)
            .NotEmpty().WithMessage("Attendance mode is required.")
            .Must(m => ValidAttendanceModes.Contains(m))
            .WithMessage($"Attendance mode must be one of: {string.Join(", ", ValidAttendanceModes)}");

        RuleFor(x => x.Location)
            .NotNull().WithMessage("Location is required.")
            .SetValidator(new LocationValidator());

        RuleFor(x => x.Performer)
            .NotNull().WithMessage("Performer is required.")
            .SetValidator(new OrganizationValidator());

        RuleFor(x => x.Organizer)
            .SetValidator(new OrganizationValidator()!)
            .When(x => x.Organizer != null);

        RuleFor(x => x.Offer)
            .NotNull().WithMessage("Offer is required.")
            .SetValidator(new OfferValidator());

        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("Provider is required.")
            .MaximumLength(200).WithMessage("Provider cannot exceed 200 characters.");

        RuleFor(x => x.CreatedAt)
            .NotEmpty().WithMessage("Created date is required.");

        RuleFor(x => x.AttendeeCount)
            .GreaterThanOrEqualTo(0).WithMessage("Attendee count cannot be negative.");
    }
}

/// <summary>
/// Validator for CreateEventEntityRequest model (used for POST create/bulk operations).
/// Does not validate Id or CreatedAt since those are set by the server.
/// </summary>
public class CreateEventEntityRequestValidator : AbstractValidator<CreateEventEntityRequest>
{
    private static readonly HashSet<string> ValidEventCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "Event", "MusicEvent", "TheaterEvent", "SportsEvent", "BusinessEvent",
        "EducationEvent", "ExhibitionEvent", "Festival", "SocialEvent", "DanceEvent",
        "ComedyEvent", "ChildrensEvent", "LiteraryEvent", "ScreeningEvent", "FoodEvent"
    };

    private static readonly HashSet<string> ValidEventStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "EventScheduled", "EventCancelled", "EventPostponed", "EventRescheduled", "EventMovedOnline"
    };

    private static readonly HashSet<string> ValidAttendanceModes = new(StringComparer.OrdinalIgnoreCase)
    {
        "OfflineEventAttendanceMode", "OnlineEventAttendanceMode", "MixedEventAttendanceMode"
    };

    public CreateEventEntityRequestValidator()
    {
        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Event type is required.")
            .Must(t => ValidEventCategories.Contains(t))
            .WithMessage($"Event type must be one of: {string.Join(", ", ValidEventCategories)}");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Event name is required.")
            .MaximumLength(300).WithMessage("Event name cannot exceed 300 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Event description is required.")
            .MaximumLength(10000).WithMessage("Event description cannot exceed 10000 characters.");

        RuleFor(x => x.ArticleBody)
            .MaximumLength(50000).WithMessage("Article body cannot exceed 50000 characters.")
            .When(x => !string.IsNullOrEmpty(x.ArticleBody));

        RuleFor(x => x.Keywords)
            .Must(k => k == null || k.Count <= 50)
            .WithMessage("Cannot have more than 50 keywords.");

        RuleForEach(x => x.Keywords)
            .MaximumLength(100).WithMessage("Each keyword cannot exceed 100 characters.")
            .When(x => x.Keywords != null && x.Keywords.Count != 0);

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End date must be after or equal to start date.")
            .When(x => x.EndDate.HasValue);

        RuleFor(x => x.DatePublished)
            .NotEmpty().WithMessage("Date published is required.");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("Event URL is required.")
            .MaximumLength(2000).WithMessage("Event URL cannot exceed 2000 characters.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Event URL must be a valid absolute URL.");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(2000).WithMessage("Image URL cannot exceed 2000 characters.")
            .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Image URL must be a valid absolute URL.")
            .When(x => !string.IsNullOrEmpty(x.ImageUrl));

        RuleFor(x => x.EventStatus)
            .NotEmpty().WithMessage("Event status is required.")
            .Must(s => ValidEventStatuses.Contains(s))
            .WithMessage($"Event status must be one of: {string.Join(", ", ValidEventStatuses)}");

        RuleFor(x => x.AttendanceMode)
            .NotEmpty().WithMessage("Attendance mode is required.")
            .Must(m => ValidAttendanceModes.Contains(m))
            .WithMessage($"Attendance mode must be one of: {string.Join(", ", ValidAttendanceModes)}");

        RuleFor(x => x.Location)
            .NotNull().WithMessage("Location is required.")
            .SetValidator(new LocationValidator());

        RuleFor(x => x.Performer)
            .NotNull().WithMessage("Performer is required.")
            .SetValidator(new OrganizationValidator());

        RuleFor(x => x.Organizer)
            .SetValidator(new OrganizationValidator()!)
            .When(x => x.Organizer != null);

        RuleFor(x => x.Offer)
            .NotNull().WithMessage("Offer is required.")
            .SetValidator(new OfferValidator());

        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("Provider is required.")
            .MaximumLength(200).WithMessage("Provider cannot exceed 200 characters.");
    }
}

/// <summary>
/// Validator for bulk event list — enforces Firestore batch write limit of 500 items.
/// </summary>
public class EventEntityListValidator : AbstractValidator<List<EventEntity>>
{
    public EventEntityListValidator()
    {
        RuleFor(x => x.Count)
            .LessThanOrEqualTo(500).WithMessage("Bulk operations are limited to 500 items per request.");

        RuleForEach(x => x)
            .SetValidator(new EventEntityValidator());
    }
}
