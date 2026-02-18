namespace Bibently.Application.Api.Services;

using System.Security.Claims;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Clients;
using Bibently.Application.Api.Mappings;
using Bibently.Application.Repository;
using Microsoft.AspNetCore.Http;

public class EventsService(IPrivateServerClient privateServerClient, IEventsRepository repository, AppMapper mapper, IHttpContextAccessor httpContextAccessor) : IEventsService
{
    public async Task<EventEntity> AddEvent(CreateEventEntityRequest request, CancellationToken token)
    {
        // todo: set createdBy first so ssot receives it
        //var eventEntity = await privateServerClient.CreateEventAsync(request, token);
        var eventDocument = mapper.Map(request);

        // Populate CreatedBy from the authenticated user's UID
        var userId = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        eventDocument.CreatedBy = userId;
        eventDocument.Id = Guid.NewGuid().ToString();
        eventDocument.CreatedAt = DateTime.UtcNow;
        await repository.InsertEvent(eventDocument, token);

        return mapper.Map(eventDocument);
    }

    public async Task AddEvents(List<EventEntity> eventEntities, CancellationToken token)
    {
        var eventDocuments = mapper.Map(eventEntities);
        foreach (var eventDocument in eventDocuments)
        {
            eventDocument.CreatedAt = DateTime.UtcNow;
        }
        await repository.InsertEvents(eventDocuments, token);
    }

    public async Task<ApiPaginationResponse> GetEvents(SearchRequest searchRequest, CancellationToken token)
    {
        var (items, nextPageToken) = await repository.GetEvents(searchRequest, token);

        return new ApiPaginationResponse
        {
            Items = mapper.MapToSummaries(mapper.Map(items)),
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
    public Task<bool> AttendEvent(Guid id, CancellationToken token)
    {
        return repository.IncrementAttendeeCount(id, 1, token);
    }

    public Task<bool> UnattendEvent(Guid id, CancellationToken token)
    {
        return repository.IncrementAttendeeCount(id, -1, token);
    }
}
