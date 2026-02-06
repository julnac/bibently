namespace Bibently.Application.Repository;

using Bibently.Application.Repository.Models;

public interface ITrackingRepository
{
    Task<TrackingEventDocument?> GetTrackingEventById(Guid id, CancellationToken token);
    Task InsertTrackingEvent(TrackingEventDocument trackingEvent, CancellationToken token);
    Task DeleteTrackingEventById(Guid id, CancellationToken token);
}
