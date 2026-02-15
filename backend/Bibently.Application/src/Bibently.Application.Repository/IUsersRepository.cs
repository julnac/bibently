namespace Bibently.Application.Repository;

using Bibently.Application.Repository.Models;

public interface IUsersRepository
{
    /// <summary>
    /// Creates or updates a user document. Uses the UID as the document ID.
    /// </summary>
    Task<UserDocument> UpsertUser(UserDocument doc, CancellationToken token);

    /// <summary>
    /// Gets a user document by Firebase UID.
    /// </summary>
    Task<UserDocument?> GetUserByUid(string uid, CancellationToken token);
}
