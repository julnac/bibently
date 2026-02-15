namespace Bibently.Application.Integration.Tests.Utils;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public static class TokenTool
{
    /// <summary>
    /// Generates a test JWT with Admin role (backward-compatible).
    /// </summary>
    public static string Generate(string? adminUid)
    {
        return Generate(adminUid, new Dictionary<string, object> { { "role", "admin" } });
    }

    /// <summary>
    /// Generates a test JWT with custom claims.
    /// Pass an empty dictionary for a regular user (no role claim → server defaults to User).
    /// </summary>
    public static string Generate(string? uid, Dictionary<string, object> customClaims)
    {
        // --- 1. HANDLE ARGUMENTS ---
        var email = "test-user@example.com";

        // --- 2. CONFIGURATION ---
        var googleProjectId = Environment.GetEnvironmentVariable("GOOGLE_CLOUD_PROJECT") ?? "demo-no-project";
        uid ??= "demo-admin-uid";
        const string testSecret = "test-secret-key-for-development-only";

        // --- 3. GENERATE CLAIMS ---
        var claims = new Dictionary<string, object>
        {
            { "email", email },
            { "email_verified", true },
            { "iss", $"https://securetoken.google.com/{googleProjectId}" },
            { "aud", googleProjectId },
            { "auth_time", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "user_id", uid },
            { "sub", uid },
            { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
            { "exp", DateTimeOffset.UtcNow.AddHours(3).ToUnixTimeSeconds() },
            { "firebase", new { identities = new { }, sign_in_provider = "custom" } }
        };

        // Merge custom claims (role, premium_attendee, etc.)
        foreach (var kvp in customClaims)
        {
            claims[kvp.Key] = kvp.Value;
        }

        // --- 4. BUILD JWT ---
        var headerEncoded = SafeBase64Encode(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" })));
        var payloadEncoded = SafeBase64Encode(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(claims)));
        var signatureInput = $"{headerEncoded}.{payloadEncoded}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(testSecret));
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(signatureInput));
        var signatureEncoded = SafeBase64Encode(signatureBytes);

        var token = $"{headerEncoded}.{payloadEncoded}.{signatureEncoded}";

        return token;

        // Local function for Base64Url encoding
        static string SafeBase64Encode(byte[] input)
        {
            return Convert.ToBase64String(input)
                .Split('=')[0]      // Remove padding
                .Replace('+', '-')  // URL safe
                .Replace('/', '_'); // URL safe
        }
    }
}
