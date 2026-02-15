namespace Bibently.Application.Repository.Models;

using Google.Cloud.Firestore;

[FirestoreData]
public class UserDocument
{
    [FirestoreProperty("uid")]
    public string Uid { get; set; } = string.Empty;

    [FirestoreProperty("email")]
    public string? Email { get; set; }

    [FirestoreProperty("role")]
    public string Role { get; set; } = string.Empty;

    [FirestoreProperty("isPremium")]
    public bool IsPremium { get; set; }

    [FirestoreProperty("createdAt")]
    public DateTime CreatedAt { get; set; }

    [FirestoreProperty("lastSeenAt")]
    public DateTime LastSeenAt { get; set; }
}
