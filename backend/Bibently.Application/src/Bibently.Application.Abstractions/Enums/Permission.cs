namespace Bibently.Application.Abstractions.Enums;

/// <summary>
/// Authorization policy names used throughout the application.
/// Each value maps to a policy registered in AuthInstaller.
/// Use <c>nameof(Permission.XYZ)</c> when referencing policies.
/// </summary>
public enum Permission
{
    /// <summary>
    /// Admin-only operations: bulk import, delete any event, manage tracking.
    /// </summary>
    ManageEvents,

    /// <summary>
    /// Any authenticated user (User + Admin) can create events and attend.
    /// </summary>
    WriteEvents,

    /// <summary>
    /// Premium-gated features: VIP events, early access, etc.
    /// Requires the "premium_attendee" custom claim.
    /// </summary>
    PremiumFeature
}
