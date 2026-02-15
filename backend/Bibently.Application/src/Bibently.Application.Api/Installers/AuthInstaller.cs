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
            .AddPolicy(nameof(Role.Admin), policy => policy.RequireRole(nameof(Role.Admin)))
            .SetFallbackPolicy(
                new AuthorizationPolicyBuilder()
                    .AddAuthenticationSchemes(FirebaseAuthenticationHandler.SchemeName)
                    .RequireAuthenticatedUser()
                    .Build());

        return services;
    }
}
