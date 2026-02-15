namespace Bibently.Application.Abstractions.Enums;

/// <summary>
/// Firebase custom claim keys used in authentication and authorization.
/// Use <c>nameof(CustomClaim.XYZ)</c> when referencing claim names
/// to avoid magic strings.
/// </summary>
public enum CustomClaim
{
    /// <summary>
    /// The user's application role (e.g., "User", "Admin").
    /// Mapped to ClaimTypes.Role during authentication.
    /// </summary>
    role,

    /// <summary>
    /// Whether the user has a premium attendee subscription.
    /// Set as a Firebase custom claim (boolean in Firebase, "true" string in .NET claims).
    /// </summary>
    premium_attendee
}
