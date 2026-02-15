namespace Bibently.Application.Repository.Models;

using Google.Cloud.Firestore;

[FirestoreData]
public class EventDocument
{
    [FirestoreProperty("id")]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("type")]
    public required string Type { get; set; }

    [FirestoreProperty("name")]
    public required string Name { get; set; }

    [FirestoreProperty("description")]
    public required string Description { get; set; }

    [FirestoreProperty("articleBody")]
    public string? ArticleBody { get; set; }

    [FirestoreProperty("keywords")]
    public List<string> Keywords { get; set; } = [];

    [FirestoreProperty("startDate")]
    public required DateTime StartDate { get; set; }

    [FirestoreProperty("endDate")]
    public DateTime? EndDate { get; set; }

    [FirestoreProperty("datePublished")]
    public required DateTime DatePublished { get; set; }

    [FirestoreProperty("url")]
    public required string Url { get; set; }

    [FirestoreProperty("imageUrl")]
    public string? ImageUrl { get; set; }

    [FirestoreProperty("eventStatus")]
    public required string EventStatus { get; set; }

    [FirestoreProperty("attendanceMode")]
    public required string AttendanceMode { get; set; }

    [FirestoreProperty("location")]
    public required LocationDocument Location { get; set; }

    [FirestoreProperty("performer")]
    public required OrganizationDocument Performer { get; set; }

    [FirestoreProperty("organizer")]
    public OrganizationDocument? Organizer { get; set; }

    [FirestoreProperty("offer")]
    public required OfferDocument Offer { get; set; }

    [FirestoreProperty("provider")]
    public required string Provider { get; set; }

    [FirestoreProperty("attendeeCount")]
    public int AttendeeCount { get; set; }

    [FirestoreProperty("createdAt")]
    public DateTime CreatedAt { get; set; }

    [FirestoreProperty("createdBy")]
    public string? CreatedBy { get; set; }
}
