namespace Bibently.Application.Repository;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Repository.Models;

public interface IEventsRepository
{
    Task<(List<EventDocument> Items, string? NextPageToken)> GetEvents(SearchRequest searchRequest, CancellationToken token);

    Task<EventDocument> InsertEvent(EventDocument eventDocument, CancellationToken token);

    Task InsertEvents(IEnumerable<EventDocument> eventDocuments, CancellationToken token);

    Task<EventDocument?> GetEventById(Guid id, CancellationToken token);

    Task DeleteEventById(Guid id, CancellationToken token);
}
