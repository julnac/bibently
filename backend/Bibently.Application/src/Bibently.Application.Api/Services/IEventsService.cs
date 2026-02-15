namespace Bibently.Application.Api.Services;

using Bibently.Application.Abstractions.Models;

public interface IEventsService
{
    Task<EventEntity> AddEvent(CreateEventEntityRequest request, CancellationToken token);

    Task AddEvents(List<EventEntity> eventEntities, CancellationToken token);

    Task<ApiPaginationResponse> GetEvents(SearchRequest searchRequest, CancellationToken token);

    Task<EventEntity?> GetEventById(Guid id, CancellationToken token);

    Task DeleteEventById(Guid id, CancellationToken token);

    Task<bool> AttendEvent(Guid id, CancellationToken token);

    Task<bool> UnattendEvent(Guid id, CancellationToken token);
}
