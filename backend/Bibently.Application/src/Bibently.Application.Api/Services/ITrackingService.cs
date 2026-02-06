namespace Bibently.Application.Api.Services;

using Bibently.Application.Abstractions.Models;

public interface ITrackingService
{
    Task<TrackingEvent?> GetTrackingEventById(Guid id, CancellationToken token);
    
    Task AddTrackingEvent(TrackingEvent trackingEvent, CancellationToken token);
    
    Task DeleteTrackingEventById(Guid id, CancellationToken token);
}
