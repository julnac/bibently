// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="RequestValidators.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Validation;

using Bibently.Application.Abstractions.Models;
using FluentValidation;

/// <summary>
/// Validator for FilterRequest model (query parameters for searching events).
/// </summary>
public class FilterRequestValidator : AbstractValidator<FilterRequest>
{
    public FilterRequestValidator()
    {
        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("City filter cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.City));

        RuleFor(x => x.Name)
            .MaximumLength(300).WithMessage("Name filter cannot exceed 300 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category filter cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.MinPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum price cannot be negative.")
            .When(x => x.MinPrice.HasValue);

        RuleFor(x => x.MaxPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Maximum price cannot be negative.")
            .When(x => x.MaxPrice.HasValue);

        RuleFor(x => x)
            .Must(x => !x.MinPrice.HasValue || !x.MaxPrice.HasValue || x.MinPrice <= x.MaxPrice)
            .WithMessage("Minimum price cannot be greater than maximum price.");

        RuleFor(x => x)
            .Must(x => !x.StartDate.HasValue || !x.EndDate.HasValue || x.StartDate <= x.EndDate)
            .WithMessage("Start date cannot be after end date.");

        RuleFor(x => x.Keywords)
            .Must(k => k is not { Length: > 20 })
            .WithMessage("Cannot filter by more than 20 keywords.");

        RuleForEach(x => x.Keywords)
            .MaximumLength(100).WithMessage("Each keyword cannot exceed 100 characters.")
            .When(x => x.Keywords != null && x.Keywords.Length != 0);
    }
}

/// <summary>
/// Validator for SortRequest model (pagination and sorting parameters).
/// Note: PageSize is only validated for minimum (>= 1). The endpoint caps excessive values at 100.
/// </summary>
public class SortRequestValidator : AbstractValidator<SortRequest>
{
    private const int MinPageSize = 1;

    public SortRequestValidator()
    {
        // Only validate minimum; the endpoint caps values > 100
        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(MinPageSize)
            .WithMessage($"Page size must be at least {MinPageSize}.")
            .When(x => x.PageSize.HasValue);

        RuleFor(x => x.PageToken)
            .MaximumLength(500).WithMessage("Page token cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.PageToken));
    }
}
