namespace Bibently.Application.Abstractions.Models;

/// <summary>
/// Domain model representing an authenticated user stored in Firestore.
/// </summary>
public class UserEntity
{
    /// <summary>
    /// Firebase UID — used as the Firestore document ID.
    /// </summary>
    public required string Uid { get; set; }

    /// <summary>
    /// User's email address from Firebase token.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Application role (e.g., "User", "Admin").
    /// </summary>
    public required string Role { get; set; }

    /// <summary>
    /// Whether the user has a premium attendee subscription.
    /// </summary>
    public bool IsPremium { get; set; }

    /// <summary>
    /// When the user document was first created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Last time the user called an authenticated endpoint.
    /// Updated on every upsert.
    /// </summary>
    public DateTime LastSeenAt { get; set; }
}
