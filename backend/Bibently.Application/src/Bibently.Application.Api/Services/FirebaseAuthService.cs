namespace Bibently.Application.Api.Services;

using FirebaseAdmin;
using FirebaseAdmin.Auth;

/// <summary>
/// Wrapper for Firebase Authentication.
/// </summary>
public class FirebaseAuthService(FirebaseApp firebaseApp) : IFirebaseAuthService
{
    public async Task<FirebaseUserInfo> VerifyIdTokenAsync(string token)
    {
        var auth = FirebaseAuth.GetAuth(firebaseApp);
        var decodedToken = await auth.VerifyIdTokenAsync(token);

        var email = decodedToken.Claims.TryGetValue("email", out var emailClaim)
            ? emailClaim.ToString()
            : null;

        return new FirebaseUserInfo(decodedToken.Uid, email, decodedToken.Claims);
    }
}
