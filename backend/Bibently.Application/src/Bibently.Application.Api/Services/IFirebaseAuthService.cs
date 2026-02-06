namespace Bibently.Application.Api.Services;

using FirebaseAdmin.Auth;

/// <summary>
/// Information about a verified Firebase user.
/// </summary>
public record FirebaseUserInfo(string Uid, string? Email, IReadOnlyDictionary<string, object> Claims);

/// <summary>
/// Service for interacting with Firebase Authentication.
/// </summary>
public interface IFirebaseAuthService
{
    /// <summary>
    /// Verifies a Firebase ID token.
    /// </summary>
    /// <param name="token">The token to verify.</param>
    /// <returns>The verified user information.</returns>
    Task<FirebaseUserInfo> VerifyIdTokenAsync(string token);
}
