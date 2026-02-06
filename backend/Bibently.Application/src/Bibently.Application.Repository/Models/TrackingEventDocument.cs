namespace Bibently.Application.Repository.Models;

using Google.Cloud.Firestore;

[FirestoreData]
public class TrackingEventDocument
{
    [FirestoreProperty("id")]
    public required string Id { get; set; }

    [FirestoreProperty("action")]
    public required string Action { get; set; }

    [FirestoreProperty("userId")]
    public required string UserId { get; set; }

    [FirestoreProperty("payload")]
    public string? Payload { get; set; }

    [FirestoreProperty("userAgent")]
    public string? UserAgent { get; set; }

    [FirestoreProperty("userLocation")]
    public string UserLocation { get; set; } = string.Empty;

    [FirestoreProperty("frontendVersion")]
    public string FrontendVersion { get; set; } = string.Empty;

    [FirestoreProperty("createdAt")]
    public required DateTime CreatedAt { get; set; }
}
