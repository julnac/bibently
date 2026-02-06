namespace Bibently.Application.Repository;

using Bibently.Application.Repository.Models;
using Google.Cloud.Firestore;
using Polly;
using Polly.Registry;

public class FirestoreTrackingRepository : ITrackingRepository
{
    private readonly FirestoreDb _db;
    private readonly ResiliencePipeline _pipeline;
    private const string CollectionPath = "tracking";

    public FirestoreTrackingRepository(FirestoreDb db, ResiliencePipelineProvider<string> pipelineProvider)
    {
        _db = db;
        _pipeline = pipelineProvider.GetPipeline("firestore");
    }

    public async Task<TrackingEventDocument?> GetTrackingEventById(Guid id, CancellationToken token)
    {
        return await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(id.ToString());
            var snapshot = await docRef.GetSnapshotAsync(ct);

            return snapshot.Exists is false ? null! : snapshot.ConvertTo<TrackingEventDocument>();
        }, token);
    }

    public async Task InsertTrackingEvent(TrackingEventDocument trackingEvent, CancellationToken token)
    {
        await _pipeline.ExecuteAsync(async ct =>
        {
            var collection = _db.Collection(CollectionPath);
            await collection.Document(trackingEvent.Id).SetAsync(trackingEvent, cancellationToken: ct);
        }, token);
    }

    public async Task DeleteTrackingEventById(Guid id, CancellationToken token)
    {
        await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(id.ToString());
            await docRef.DeleteAsync(cancellationToken: ct);
        }, token);
    }
}
