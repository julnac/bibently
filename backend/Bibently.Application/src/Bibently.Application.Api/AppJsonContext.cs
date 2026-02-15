namespace Bibently.Application.Api;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Abstractions.Enums;
using System.Text.Json.Serialization;

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    UseStringEnumConverter = true)]
[JsonSerializable(typeof(ErrorResponse))]
[JsonSerializable(typeof(ApiPaginationResponse))]
[JsonSerializable(typeof(EventEntity))]
[JsonSerializable(typeof(List<EventEntity>))]
[JsonSerializable(typeof(CreateEventEntityRequest))]
[JsonSerializable(typeof(TrackingEvent))]
[JsonSerializable(typeof(List<TrackingEvent>))]
[JsonSerializable(typeof(FilterRequest))]
[JsonSerializable(typeof(SortRequest))]
[JsonSerializable(typeof(SearchRequest))]
[JsonSerializable(typeof(EventSortableAccessor))]
[JsonSerializable(typeof(EventSortableAccessor?))]
[JsonSerializable(typeof(SortDirection))]
[JsonSerializable(typeof(SortDirection?))]
[JsonSerializable(typeof(Role))]
[JsonSerializable(typeof(string[]))]
[JsonSerializable(typeof(Address))]
[JsonSerializable(typeof(Location))]
[JsonSerializable(typeof(Organization))]
[JsonSerializable(typeof(Offer))]
[JsonSerializable(typeof(DateTime?))]
[JsonSerializable(typeof(double?))]
[JsonSerializable(typeof(int?))]
[JsonSerializable(typeof(Guid))]
[JsonSerializable(typeof(Guid?))]
[JsonSerializable(typeof(List<string>))]
[JsonSerializable(typeof(IEnumerable<EventEntity>))]
[JsonSerializable(typeof(Microsoft.AspNetCore.Mvc.ProblemDetails))]
[JsonSerializable(typeof(HttpValidationProblemDetails))]
[JsonSerializable(typeof(Dictionary<string, string[]>))]
internal partial class AppJsonContext : JsonSerializerContext
{
}

public record ErrorResponse(string Error);
