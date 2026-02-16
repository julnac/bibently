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
            bool isGeoFiltering = false;
            double centerLat = 0, centerLng = 0, radiusKm = 10;

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

                if (!string.IsNullOrEmpty(filters.Category))
                    query = query.WhereEqualTo("type", filters.Category);

                if (filters.Keywords != null && filters.Keywords.Length != 0)
                    query = query.WhereArrayContainsAny("keywords", filters.Keywords);

                // Geo bounding box pre-filter
                if (filters is { Latitude: not null, Longitude: not null })
                {
                    isGeoFiltering = true;
                    centerLat = filters.Latitude.Value;
                    centerLng = filters.Longitude.Value;
                    radiusKm = filters.RadiusKm ?? 10;

                    var (minLat, maxLat, minLng, maxLng) = GeoUtils.BoundingBox(centerLat, centerLng, radiusKm);

                    query = query
                        .WhereGreaterThanOrEqualTo("location.address.latitude", minLat)
                        .WhereLessThanOrEqualTo("location.address.latitude", maxLat)
                        .WhereGreaterThanOrEqualTo("location.address.longitude", minLng)
                        .WhereLessThanOrEqualTo("location.address.longitude", maxLng);
                }
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

            // Apply pagination — over-fetch when geo-filtering since Haversine will remove some
            var pageSize = sorting.PageSize.HasValue && sorting.PageSize > 0 ? sorting.PageSize.Value : 20;
            var fetchLimit = isGeoFiltering ? pageSize * 2 : pageSize;
            query = query.Limit(fetchLimit);

            if (!string.IsNullOrEmpty(sorting.PageToken))
            {
                DocumentReference lastDocRef = _db.Collection(CollectionPath).Document(sorting.PageToken);
                DocumentSnapshot lastDocSnapshot = await lastDocRef.GetSnapshotAsync(ct);
                if (lastDocSnapshot.Exists)
                {
                    query = query.StartAfter(lastDocSnapshot);
                }
            }

            QuerySnapshot snapshot = await query.GetSnapshotAsync(ct);
            var items = snapshot.Documents.Select(doc => doc.ConvertTo<EventDocument>()).ToList();

            // Haversine post-filter: bounding box is a square, but radius is a circle
            if (isGeoFiltering)
            {
                items = items
                    .Where(e => GeoUtils.DistanceKm(
                        centerLat, centerLng,
                        e.Location.Address.Latitude.GetValueOrDefault(),
                        e.Location.Address.Longitude.GetValueOrDefault()) <= radiusKm)
                    .Take(pageSize)
                    .ToList();
            }

            string? nextPageToken = null;
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

    public async Task<bool> IncrementAttendeeCount(Guid id, int delta, CancellationToken token)
    {
        return await _pipeline.ExecuteAsync(async ct =>
        {
            var docRef = _db.Collection(CollectionPath).Document(id.ToString());
            var snapshot = await docRef.GetSnapshotAsync(ct);

            if (!snapshot.Exists)
            {
                return false;
            }

            await docRef.UpdateAsync("attendeeCount", FieldValue.Increment(delta), cancellationToken: ct);
            return true;
        }, token);
    }
}
