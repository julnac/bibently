namespace Bibently.Application.Api.Extensions;

using Bibently.Application.Abstractions.Enums;
using System.Security.Claims;

/// <summary>
/// Extension methods for HttpContext to simplify access to authenticated user information
/// via the standard <see cref="ClaimsPrincipal"/>.
/// </summary>
public static class HttpContextExtensions
{
    /// <summary>
    /// Determines if the current request is from an authenticated user.
    /// </summary>
    public static bool IsAuthenticated(this HttpContext context)
    {
        return context.User.Identity?.IsAuthenticated == true;
    }

    /// <summary>
    /// Gets the current user's UID if authenticated.
    /// </summary>
    public static string? GetUserId(this HttpContext context)
    {
        return context.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    /// <summary>
    /// Gets the current user's email if authenticated.
    /// </summary>
    public static string? GetUserEmail(this HttpContext context)
    {
        return context.User.FindFirstValue(ClaimTypes.Email);
    }

    /// <summary>
    /// Checks if the current user has the admin role.
    /// </summary>
    public static bool IsAdmin(this HttpContext context)
    {
        return context.User.IsInRole(Role.Admin.ToString());
    }
}
