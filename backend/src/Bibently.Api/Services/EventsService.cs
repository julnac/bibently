namespace Bibently.Application.Services;

using AutoMapper;
using Bibently.Application.Models;
using Bibently.Repository;
using Bibently.Repository.Models;

public class EventsService(IEventsRepository repository, IMapper mapper) : IEventsService
{
    public async Task<Event> AddEvent(Event eventEntity, CancellationToken token)
    {
        var eventDocument = await repository.InsertEvent(mapper.Map<EventDocument>(eventEntity), token);
        
        return mapper.Map<Event>(eventDocument);
    }
    
    public async Task<List<Event>> GetEvents(CancellationToken token)
    {
        var events = await repository.GetEvents(token);
        
        return mapper.Map<List<Event>>(events);
    }
    
    public async Task<Event> GetEventById(Guid id, CancellationToken token)
    {
        var eventDocument = await repository.GetEventById(id, token);
        
        return mapper.Map<Event>(eventDocument);
    }

    public Task DeleteEventById(Guid id, CancellationToken token)
    {
        return repository.DeleteEventById(id, token);
    }
}