namespace Bibently.Application.Abstractions.Models;

using Bibently.Application.Abstractions.Enums;

public class SortRequest
{
    public EventSortableAccessor? SortKey { get; init; } = EventSortableAccessor.StartDate;
    public SortDirection? Order { get; init; } = SortDirection.Ascending;
    public int? PageSize { get; set; } = 20;
    public string? PageToken { get; init; }
}
