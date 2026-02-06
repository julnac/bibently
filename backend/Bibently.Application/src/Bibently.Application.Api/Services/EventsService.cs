namespace Bibently.Application.Api.Services;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Mappings;
using Bibently.Application.Repository;

public class EventsService(IEventsRepository repository, AppMapper mapper) : IEventsService
{
    public async Task<EventEntity> AddEvent(EventEntity eventEntity, CancellationToken token)
    {
        var eventDocument = await repository.InsertEvent(mapper.Map(eventEntity), token);

        return mapper.Map(eventDocument);
    }

    public async Task AddEvents(IEnumerable<EventEntity> eventEntities, CancellationToken token)
    {
        var eventDocuments = mapper.Map(eventEntities);
        await repository.InsertEvents(eventDocuments, token);
    }

    public async Task<ApiPaginationResponse> GetEvents(SearchRequest searchRequest, CancellationToken token)
    {
        var (items, nextPageToken) = await repository.GetEvents(searchRequest, token);

        return new ApiPaginationResponse
        {
            Items = mapper.Map(items),
            NextPageToken = nextPageToken
        };
    }

    public async Task<EventEntity?> GetEventById(Guid id, CancellationToken token)
    {
        var eventDocument = await repository.GetEventById(id, token);

        return eventDocument is null ? null : mapper.Map(eventDocument);
    }

    public Task DeleteEventById(Guid id, CancellationToken token)
    {
        return repository.DeleteEventById(id, token);
    }
}
