// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="EventSummary.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Abstractions.Models;

/// <summary>
/// Slim DTO returned as items in the paginated GET /events list response.
/// Contains only the fields needed for displaying event cards in a listing view.
/// For the full event details, use GET /events/{id} which returns <see cref="EventEntity"/>.
/// </summary>
public class EventSummary
{
    public required Guid Id { get; init; }

    public required string Category { get; init; }

    public required string Name { get; init; }

    public List<string> Keywords { get; init; } = [];

    public required DateTime StartDate { get; init; }

    public DateTime? EndDate { get; init; }

    public string? ImageUrl { get; init; }

    public required string EventStatus { get; init; }

    public required string AttendanceMode { get; init; }

    public required Location Location { get; init; }

    /// <summary>Flattened from <see cref="Offer.Price"/>.</summary>
    public required double Price { get; init; }

    /// <summary>Flattened from <see cref="Offer.Currency"/>.</summary>
    public required string Currency { get; init; }

    public int AttendeeCount { get; init; }
}
