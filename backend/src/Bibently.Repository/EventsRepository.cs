namespace Bibently.Repository;

using Bibently.Repository.Models;
using MongoDB.Driver;

public class EventsRepository(IMongoDatabase database) : IEventsRepository
{
    private const string EventsCollectionName = "events";
    
    public async Task<List<EventDocument>> GetEvents(CancellationToken token)
    {
        return await database.GetCollection<EventDocument>(EventsCollectionName)
            .Find(_ => true)
            .ToListAsync(token);
    }
    
    public async Task<EventDocument> InsertEvent(EventDocument eventDocument, CancellationToken token)
    {
        var collection = database.GetCollection<EventDocument>(EventsCollectionName);
        await collection.InsertOneAsync(eventDocument, new InsertOneOptions(), token);
        return eventDocument;
    }
    
    public async Task<EventDocument> GetEventById(Guid id, CancellationToken token)
    {
        return await database.GetCollection<EventDocument>(EventsCollectionName)
            .Find(e => e.Id == id)
            .FirstOrDefaultAsync(token);
    }

    public Task DeleteEventById(Guid id, CancellationToken token)
    {
        return database.GetCollection<EventDocument>(EventsCollectionName)
            .DeleteOneAsync(e => e.Id == id, token);
    }
}
