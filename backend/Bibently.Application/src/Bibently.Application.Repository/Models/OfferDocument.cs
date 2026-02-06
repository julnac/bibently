namespace Bibently.Application.Repository.Models;

using Google.Cloud.Firestore;

[FirestoreData]
public class OfferDocument
{
    [FirestoreProperty("type")]
    public required string Type { get; set; }

    [FirestoreProperty("price")]
    public required double Price { get; set; }

    [FirestoreProperty("currency")]
    public required string Currency { get; set; }

    [FirestoreProperty("url")]
    public required string Url { get; set; }

    [FirestoreProperty("isAvailable")]
    public required bool IsAvailable { get; set; }

    [FirestoreProperty("statusText")]
    public string? StatusText { get; set; }

    [FirestoreProperty("availabilityType")]
    public string? AvailabilityType { get; set; }
}
