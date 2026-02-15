namespace Bibently.Application.Abstractions.Models;

/// <summary>
/// Feature flags that indicate what actions the authenticated user can perform.
/// These map directly to the authorization policies defined in AuthInstaller.
/// </summary>
public class UserFeatureFlags
{
    /// <summary>
    /// Can the user create events? (Maps to WriteEvents policy)
    /// </summary>
    public bool CanCreateEvents { get; set; }

    /// <summary>
    /// Can the user delete any event? (Maps to ManageEvents policy)
    /// </summary>
    public bool CanDeleteAnyEvent { get; set; }

    /// <summary>
    /// Can the user use bulk import? (Maps to ManageEvents policy)
    /// </summary>
    public bool CanBulkImport { get; set; }

    /// <summary>
    /// Can the user access VIP/premium-only events? (Maps to PremiumFeature policy)
    /// </summary>
    public bool CanAccessVipEvents { get; set; }
}
