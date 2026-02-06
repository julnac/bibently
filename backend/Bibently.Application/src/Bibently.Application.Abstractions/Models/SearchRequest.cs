namespace Bibently.Application.Abstractions.Models;

public class SearchRequest
{
    public FilterRequest? Filters { get; init; }
    public SortRequest? Sorting { get; init; }
}
