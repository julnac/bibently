namespace Bibently.Application.Api.Endpoints;

using System.Security.Claims;
using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Services;

/// <summary>
/// Endpoints for the authenticated user's own data and permissions.
/// </summary>
public static class MeEndpoints
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/me/permissions", async (HttpContext httpContext, IUsersService usersService, CancellationToken token) =>
        {
            var user = httpContext.User;

            // Upsert user document in Firestore (awaited)
            await usersService.EnsureUserExists(user, token);

            var role = user.FindFirst(ClaimTypes.Role)?.Value ?? nameof(Role.User);
            var isAdmin = string.Equals(role, nameof(Role.Admin), StringComparison.OrdinalIgnoreCase);
            var isPremium = user.HasClaim(nameof(CustomClaim.premium_attendee), "true");

            var response = new UserPermissionsResponse
            {
                Role = role,
                IsPremium = isPremium,
                Features = new UserFeatureFlags
                {
                    CanCreateEvents = true,      // WriteEvents: User + Admin
                    CanDeleteAnyEvent = isAdmin,  // ManageEvents: Admin only
                    CanBulkImport = isAdmin,      // ManageEvents: Admin only
                    CanAccessVipEvents = isPremium // PremiumFeature: premium_attendee claim
                }
            };

            return Results.Ok(response);
        });
        // Fallback policy requires authentication — no explicit RequireAuthorization needed
    }
}
