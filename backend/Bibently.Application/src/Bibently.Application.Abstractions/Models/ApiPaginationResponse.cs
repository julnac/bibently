namespace Bibently.Application.Abstractions.Models;

using System.Text.Json.Serialization;

public class ApiPaginationResponse
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<EventSummary>? Items { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? NextPageToken { get; set; }
}
