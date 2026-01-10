namespace Bibently.Repository;

using Bibently.Repository.Models;

public interface IEventsRepository
{
    Task<List<EventDocument>> GetEvents(CancellationToken token);
    Task<EventDocument> InsertEvent(EventDocument eventDocument, CancellationToken token);

    Task<EventDocument> GetEventById(Guid id, CancellationToken token);
    
    Task DeleteEventById(Guid id, CancellationToken token);
}