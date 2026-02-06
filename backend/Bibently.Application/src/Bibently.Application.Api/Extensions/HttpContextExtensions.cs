namespace Bibently.Application.Api.Extensions;

using Bibently.Application.Api.Middleware;

/// <summary>
/// Extension methods for HttpContext to simplify access to authenticated user information.
/// </summary>
public static class HttpContextExtensions
{
    /// <summary>
    /// Gets the authenticated user from the current HttpContext.
    /// </summary>
    /// <param name="context">The current HttpContext.</param>
    /// <returns>The authenticated user if available, otherwise null.</returns>
    public static AuthenticatedUser? GetAuthenticatedUser(this HttpContext context)
    {
        return context.Items[typeof(AuthenticatedUser)] as AuthenticatedUser;
    }

    /// <summary>
    /// Determines if the current request is from an authenticated user.
    /// </summary>
    /// <param name="context">The current HttpContext.</param>
    /// <returns>True if a user is authenticated, otherwise false.</returns>
    public static bool IsAuthenticated(this HttpContext context)
    {
        return context.GetAuthenticatedUser() != null;
    }

    /// <summary>
    /// Gets the current user's UID if authenticated.
    /// </summary>
    /// <param name="context">The current HttpContext.</param>
    /// <returns>The user's UID if authenticated, otherwise null.</returns>
    public static string? GetUserId(this HttpContext context)
    {
        return context.GetAuthenticatedUser()?.Uid;
    }

    /// <summary>
    /// Gets the current user's email if authenticated.
    /// </summary>
    /// <param name="context">The current HttpContext.</param>
    /// <returns>The user's email if authenticated, otherwise null.</returns>
    public static string? GetUserEmail(this HttpContext context)
    {
        return context.GetAuthenticatedUser()?.Email;
    }

    /// <summary>
    /// Gets a specific claim from the current user.
    /// </summary>
    /// <param name="context">The current HttpContext.</param>
    /// <param name="claimKey">The key of the claim to retrieve.</param>
    /// <returns>The claim value if found, otherwise null.</returns>
    public static object? GetUserClaim(this HttpContext context, string claimKey)
    {
        var user = context.GetAuthenticatedUser();
        if (user?.Claims.TryGetValue(claimKey, out var claimValue) == true)
        {
            return claimValue;
        }

        return null;
    }
}
