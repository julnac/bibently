namespace Bibently.Application.Api.Services;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Mappings;
using Bibently.Application.Repository;

public class TrackingService(ITrackingRepository repository, AppMapper mapper) : ITrackingService
{
    public async Task<TrackingEvent?> GetTrackingEventById(Guid id, CancellationToken token)
    {
        var doc = await repository.GetTrackingEventById(id, token);
        return doc is null ? null : mapper.Map(doc);
    }

    public async Task AddTrackingEvent(TrackingEvent trackingEvent, CancellationToken token)
    {
        var doc = mapper.Map(trackingEvent);
        await repository.InsertTrackingEvent(doc, token);
    }

    public Task DeleteTrackingEventById(Guid id, CancellationToken token)
    {
        return repository.DeleteTrackingEventById(id, token);
    }
}
