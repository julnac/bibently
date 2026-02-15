namespace Bibently.Application.Repository;

using Bibently.Application.Repository.Models;
using Google.Cloud.Firestore;
using Polly;
using Polly.Registry;

public class FirestoreUsersRepository : IUsersRepository
{
    private readonly FirestoreDb _db;
    private readonly ResiliencePipeline _pipeline;
    private const string CollectionPath = "users";

    public FirestoreUsersRepository(FirestoreDb db, ResiliencePipelineProvider<string> pipelineProvider)
    {
        _db = db;
        _pipeline = pipelineProvider.GetPipeline("firestore");
    }

    public async Task<UserDocument> UpsertUser(UserDocument doc, CancellationToken token)
    {
        await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(doc.Uid);
            var snapshot = await docRef.GetSnapshotAsync(ct);

            if (snapshot.Exists)
            {
                // Update mutable fields only — preserve CreatedAt
                await docRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "email", doc.Email ?? "" },
                    { "role", doc.Role },
                    { "isPremium", doc.IsPremium },
                    { "lastSeenAt", doc.LastSeenAt }
                }, cancellationToken: ct);
            }
            else
            {
                // First time — set everything including CreatedAt
                await docRef.SetAsync(doc, cancellationToken: ct);
            }
        }, token);

        return doc;
    }

    public async Task<UserDocument?> GetUserByUid(string uid, CancellationToken token)
    {
        return await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(uid);
            var snapshot = await docRef.GetSnapshotAsync(ct);
            return snapshot.Exists ? snapshot.ConvertTo<UserDocument>() : null;
        }, token);
    }
}
