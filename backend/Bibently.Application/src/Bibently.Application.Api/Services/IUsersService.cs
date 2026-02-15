namespace Bibently.Application.Api.Services;

using System.Security.Claims;
using Bibently.Application.Abstractions.Models;

public interface IUsersService
{
    /// <summary>
    /// Ensures a user document exists in Firestore for the authenticated user.
    /// Creates on first call, updates LastSeenAt on subsequent calls.
    /// </summary>
    Task<UserEntity> EnsureUserExists(ClaimsPrincipal user, CancellationToken token);
}
