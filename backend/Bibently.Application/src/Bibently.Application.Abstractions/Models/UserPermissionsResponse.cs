namespace Bibently.Application.Abstractions.Models;

/// <summary>
/// Response model for the GET /me/permissions endpoint.
/// Contains the user's current role, subscription status, and computed feature flags.
/// </summary>
public class UserPermissionsResponse
{
    /// <summary>
    /// The user's global role (e.g., "User", "Admin").
    /// </summary>
    public required string Role { get; set; }

    /// <summary>
    /// Whether the user has a premium attendee subscription.
    /// </summary>
    public required bool IsPremium { get; set; }

    /// <summary>
    /// Computed feature flags derived from the user's role and claims.
    /// The frontend should use these to toggle UI features.
    /// </summary>
    public required UserFeatureFlags Features { get; set; }
}

