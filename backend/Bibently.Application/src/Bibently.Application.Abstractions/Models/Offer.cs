namespace Bibently.Application.Abstractions.Models;

public class Offer
{
    public required string Type { get; init; }

    public required double Price { get; init; }

    public required string Currency { get; init; }

    public required string Url { get; init; }

    public required bool IsAvailable { get; init; }

    public string? StatusText { get; init; }

    public string? AvailabilityType { get; init; }
}
