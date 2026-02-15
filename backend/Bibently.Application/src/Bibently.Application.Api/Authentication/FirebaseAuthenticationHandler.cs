namespace Bibently.Application.Api.Authentication;

using System.Security.Claims;
using System.Text.Encodings.Web;
using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

/// <summary>
/// Custom ASP.NET Core authentication handler that validates Firebase ID tokens.
/// Extracts the Bearer token from the Authorization header, verifies it via
/// <see cref="IFirebaseAuthService"/>, and produces a <see cref="ClaimsPrincipal"/>
/// with the user's uid, email, and role claims.
/// </summary>
public sealed class FirebaseAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IFirebaseAuthService authService)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Firebase";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";

        if (string.IsNullOrEmpty(authHeader) ||
            !authHeader.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.NoResult();
        }

        var token = authHeader[prefix.Length..].Trim();
        if (string.IsNullOrEmpty(token))
        {
            return AuthenticateResult.NoResult();
        }

        try
        {
            var userInfo = await authService.VerifyIdTokenAsync(token);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userInfo.Uid),
            };

            if (!string.IsNullOrEmpty(userInfo.Email))
            {
                claims.Add(new Claim(ClaimTypes.Email, userInfo.Email));
            }

            // Map the "role" custom claim to ClaimTypes.Role for RequireRole() policies
            if (userInfo.Claims.TryGetValue(nameof(CustomClaim.role), out var role) && role is string roleStr)
            {
                if (Enum.TryParse<Role>(roleStr, true, out var roleEnum))
                {
                    claims.Add(new Claim(ClaimTypes.Role, roleEnum.ToString()));
                }
            }
            else
            {
                // Every authenticated user gets "User" role by default
                claims.Add(new Claim(ClaimTypes.Role, nameof(Role.User)));
            }

            // Extract premium_attendee custom claim for subscription gating
            if (userInfo.Claims.TryGetValue(nameof(CustomClaim.premium_attendee), out var premium) && premium is bool isPremium && isPremium)
            {
                claims.Add(new Claim(nameof(CustomClaim.premium_attendee), "true"));
            }

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            Logger.LogWarning("Firebase token verification failed: {Message}", ex.Message);
            return AuthenticateResult.Fail($"Token validation failed: {ex.Message}");
        }
    }
}
