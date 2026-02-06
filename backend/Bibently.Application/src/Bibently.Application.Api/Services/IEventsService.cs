namespace Bibently.Application.Api.Services;

using Bibently.Application.Abstractions.Models;

public interface IEventsService
{
    Task<EventEntity> AddEvent(EventEntity eventEntity, CancellationToken token);

    Task AddEvents(IEnumerable<EventEntity> eventEntities, CancellationToken token);

    Task<ApiPaginationResponse> GetEvents(SearchRequest searchRequest, CancellationToken token);

    Task<EventEntity?> GetEventById(Guid id, CancellationToken token);

    Task DeleteEventById(Guid id, CancellationToken token);
}
