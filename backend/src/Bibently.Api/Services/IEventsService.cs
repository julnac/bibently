namespace Bibently.Application.Services;

using Bibently.Application.Models;

public interface IEventsService
{
    Task<Event> AddEvent(Event eventEntity, CancellationToken token);

    Task<List<Event>> GetEvents(CancellationToken token);

    Task<Event> GetEventById(Guid id, CancellationToken token);
    
    Task DeleteEventById(Guid id, CancellationToken token);
}