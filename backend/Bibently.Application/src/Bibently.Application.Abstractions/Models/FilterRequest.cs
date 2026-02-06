namespace Bibently.Application.Abstractions.Models;

public class FilterRequest
{
    public string? City { get; init; }
    public string? Name { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public double? MinPrice { get; init; }
    public double? MaxPrice { get; init; }
    public string? Type { get; init; }
    public List<string>? Keywords { get; init; } = [];
}
