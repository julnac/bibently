namespace Bibently.Application.Api.Services;

using System.Security.Claims;
using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Mappings;
using Bibently.Application.Repository;

public class UsersService(IUsersRepository repository, AppMapper mapper) : IUsersService
{
    public async Task<UserEntity> EnsureUserExists(ClaimsPrincipal user, CancellationToken token)
    {
        var uid = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("Authenticated user has no UID claim.");

        var email = user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst("email")?.Value;

        var role = user.FindFirst(ClaimTypes.Role)?.Value ?? nameof(Role.User);
        var isPremium = user.HasClaim(nameof(CustomClaim.premium_attendee), "true");

        var userEntity = new UserEntity
        {
            Uid = uid,
            Email = email,
            Role = role,
            IsPremium = isPremium,
            CreatedAt = DateTime.UtcNow,
            LastSeenAt = DateTime.UtcNow
        };

        var userDocument = mapper.Map(userEntity);
        await repository.UpsertUser(userDocument, token);

        return userEntity;
    }
}
