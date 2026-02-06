namespace Bibently.Application.Abstractions.Models;

public class Location
{
    public required string Type { get; init; }

    public required string Name { get; init; }

    public required Address Address { get; init; }
}
