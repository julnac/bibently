namespace Bibently.Application.Abstractions.Models;

public class Address
{
    public required string Type { get; init; }

    public required string Name { get; init; }

    public string? Street { get; init; }

    public required string City { get; init; }

    public required string Country { get; init; }

    public string? PostalCode { get; init; }

    public string? RawAddressString { get; init; }

    public double? Latitude { get; init; }

    public double? Longitude { get; init; }
}
