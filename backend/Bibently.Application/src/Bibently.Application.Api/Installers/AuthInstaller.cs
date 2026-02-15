namespace Bibently.Application.Api.Installers;

using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Api.Authentication;
using Bibently.Application.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

/// <summary>
/// Registers ASP.NET Core authentication (Firebase) and authorization policies.
/// </summary>
public static class AuthInstaller
{
    public static IServiceCollection AddAppAuth(this IServiceCollection services)
    {
        services.AddSingleton<IFirebaseAuthService, FirebaseAuthService>();

        services
            .AddAuthentication(FirebaseAuthenticationHandler.SchemeName)
            .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>(
                FirebaseAuthenticationHandler.SchemeName, null);

        services.AddAuthorizationBuilder()
            // Admin-only operations (bulk import, delete any event)
            .AddPolicy(nameof(Permission.ManageEvents), policy => policy.RequireRole(nameof(Role.Admin)))
            // Any authenticated user can create events and attend
            .AddPolicy(nameof(Permission.WriteEvents), policy => policy.RequireRole(nameof(Role.Admin), nameof(Role.User)))
            // Premium-gated features (future: VIP events, early access)
            .AddPolicy(nameof(Permission.PremiumFeature), policy => policy.RequireClaim(nameof(CustomClaim.premium_attendee), "true"))
            // Fallback: all endpoints require authentication unless AllowAnonymous
            .SetFallbackPolicy(
                new AuthorizationPolicyBuilder()
                    .AddAuthenticationSchemes(FirebaseAuthenticationHandler.SchemeName)
                    .RequireAuthenticatedUser()
                    .Build());

        return services;
    }
}
