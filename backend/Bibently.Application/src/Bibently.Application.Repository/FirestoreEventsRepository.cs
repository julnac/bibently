namespace Bibently.Application.Repository;

using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Repository.Models;
using Google.Cloud.Firestore;
using Polly;
using Polly.Registry;

public class FirestoreEventsRepository : IEventsRepository
{
    private readonly FirestoreDb _db;
    private readonly ResiliencePipeline _pipeline;
    private const string CollectionPath = "events";

    public FirestoreEventsRepository(FirestoreDb db, ResiliencePipelineProvider<string> pipelineProvider)
    {
        _db = db;
        _pipeline = pipelineProvider.GetPipeline("firestore");
    }

    public async Task<(List<EventDocument> Items, string? NextPageToken)> GetEvents(SearchRequest searchRequest, CancellationToken token)
    {
        return await _pipeline.ExecuteAsync(async ct =>
        {
            Query query = _db.Collection(CollectionPath);

            // Apply filters
            var filters = searchRequest.Filters;
            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.City))
                    query = query.WhereEqualTo("location.address.city", filters.City);

                if (!string.IsNullOrEmpty(filters.Name))
                    query = query.WhereGreaterThanOrEqualTo("name", filters.Name)
                                 .WhereLessThanOrEqualTo("name", filters.Name + "\uf8ff");

                if (filters.StartDate.HasValue)
                    query = query.WhereGreaterThanOrEqualTo("startDate", filters.StartDate.Value.ToUniversalTime());

                if (filters.EndDate.HasValue)
                    query = query.WhereLessThanOrEqualTo("startDate", filters.EndDate.Value.ToUniversalTime());

                if (filters.MinPrice.HasValue)
                    query = query.WhereGreaterThanOrEqualTo("offer.price", filters.MinPrice.Value);

                if (filters.MaxPrice.HasValue)
                    query = query.WhereLessThanOrEqualTo("offer.price", filters.MaxPrice.Value);

                if (!string.IsNullOrEmpty(filters.Type))
                    query = query.WhereEqualTo("type", filters.Type);

                if (filters.Keywords != null && filters.Keywords.Count != 0)
                    query = query.WhereArrayContainsAny("keywords", filters.Keywords);
            }

            // Apply sorting
            var sorting = searchRequest.Sorting ?? new SortRequest();
            bool isAscending = sorting.Order != SortDirection.Descending;

            string sortField = sorting.SortKey switch
            {
                EventSortableAccessor.StartDate => "startDate",
                EventSortableAccessor.CreatedAt => "createdAt",
                EventSortableAccessor.Name => "name",
                EventSortableAccessor.DatePublished => "datePublished",
                EventSortableAccessor.Price => "offer.price",
                _ => "startDate"
            };

            query = isAscending ? query.OrderBy(sortField) : query.OrderByDescending(sortField);

            // Apply pagination
            query = query.Limit(sorting.PageSize.HasValue && sorting.PageSize > 0 ? sorting.PageSize.Value : 20);

            if (!string.IsNullOrEmpty(sorting.PageToken))
            {
                // Simple pagination: the token is the last document's ID
                DocumentReference lastDocRef = _db.Collection(CollectionPath).Document(sorting.PageToken);
                DocumentSnapshot lastDocSnapshot = await lastDocRef.GetSnapshotAsync(ct);
                if (lastDocSnapshot.Exists)
                {
                    query = query.StartAfter(lastDocSnapshot);
                }
            }

            QuerySnapshot snapshot = await query.GetSnapshotAsync(ct);
            var items = snapshot.Documents.Select(doc => doc.ConvertTo<EventDocument>()).ToList();

            string? nextPageToken = null;
            var pageSize = sorting.PageSize.HasValue && sorting.PageSize > 0 ? sorting.PageSize.Value : 20;
            if (items.Count > 0 && items.Count == pageSize)
            {
                nextPageToken = items[^1].Id;
            }

            return (items, nextPageToken);
        }, token);
    }

    public async Task<EventDocument?> GetEventById(Guid id, CancellationToken token)
    {
        return await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(id.ToString());
            var snapshot = await docRef.GetSnapshotAsync(ct);

            return snapshot.Exists is false ? null : snapshot.ConvertTo<EventDocument>();
        }, token);
    }

    public async Task<EventDocument> InsertEvent(EventDocument eventDocument, CancellationToken token)
    {
        await _pipeline.ExecuteAsync(async ct =>
        {
            var collection = _db.Collection(CollectionPath);
            await collection.Document(eventDocument.Id).SetAsync(eventDocument, cancellationToken: ct);
        }, token);

        return eventDocument;
    }

    public async Task InsertEvents(IEnumerable<EventDocument> eventDocuments, CancellationToken token)
    {
        await _pipeline.ExecuteAsync(async ct =>
        {
            var batch = _db.StartBatch();
            var collection = _db.Collection(CollectionPath);

            foreach (var doc in eventDocuments)
            {
                var docRef = collection.Document(doc.Id);
                batch.Set(docRef, doc);
            }

            await batch.CommitAsync(ct);
        }, token);
    }

    public async Task DeleteEventById(Guid id, CancellationToken token)
    {
        await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(id.ToString());
            await docRef.DeleteAsync(cancellationToken: ct);
        }, token);
    }
}
