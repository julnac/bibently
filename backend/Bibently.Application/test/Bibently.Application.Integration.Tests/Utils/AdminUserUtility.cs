namespace Bibently.Application.Integration.Tests.Utils;

using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Serilog;
using Xunit;

public class AdminUserUtility(ITestOutputHelper outputHelper)
{
    public async Task EnsureLocalAdminUserAsync(string? adminUid)
    {
        if (string.IsNullOrEmpty(adminUid))
        {
            outputHelper.WriteLine("⚠️ [Admin Setup] adminUid is null or empty. Skipping admin user creation.");
            Log.Warning("⚠️ [Admin Setup] adminUid is null or empty. Skipping admin user creation.");
            return;
        }

        var projectId = Environment.GetEnvironmentVariable("GOOGLE_CLOUD_PROJECT") ?? "demo-no-project";
        var emulatorHost = Environment.GetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST");

        // If explicitly running in local/test mode and host is missing, default to localhost
        if (string.IsNullOrEmpty(emulatorHost))
        {
            emulatorHost = "localhost:9099";
            Environment.SetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST", emulatorHost);
            outputHelper.WriteLine($"ℹ️ [Admin Setup] Setting default FIREBASE_AUTH_EMULATOR_HOST to {emulatorHost}");
            Log.Information("ℹ️ [Admin Setup] Setting default FIREBASE_AUTH_EMULATOR_HOST to {Host}", emulatorHost);
        }

        // In development/test with emulator, we don't need real credentials.
        // We use a dummy token to satisfy the SDK's initialization requirement.
        if (FirebaseApp.DefaultInstance == null)
        {
            try
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromAccessToken("dummy-access-token"),
                    ProjectId = projectId
                });
            }
            catch (Exception ex)
            {
                outputHelper.WriteLine(ex + "⚠️ [Admin Setup] Failed to initialize FirebaseApp");
                Log.Error(ex, "⚠️ [Admin Setup] Failed to initialize FirebaseApp");
                return;
            }
        }

        var auth = FirebaseAuth.DefaultInstance;
        var maxRetries = 3;

        // Check if emulator is running
        if (!string.IsNullOrEmpty(emulatorHost))
        {
            if (!await IsEmulatorRunning(emulatorHost))
            {
                outputHelper.WriteLine($"⚠️ [Admin Setup] Auth Emulator is not running at {emulatorHost}. Skipping admin user creation.");
                Log.Warning("⚠️ [Admin Setup] Auth Emulator is not running at {Host}. Skipping admin user creation.", emulatorHost);
                return;
            }
        }

        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                var userRecord = await auth.GetUserAsync(adminUid);
                outputHelper.WriteLine($"✅ [Admin Setup] User already exists: {adminUid}");
                Log.Information("✅ [Admin Setup] User already exists: {AdminUid}", adminUid);
                return;
            }
            catch (FirebaseAuthException ex) when (ex.AuthErrorCode == AuthErrorCode.UserNotFound)
            {
                // Proceed to create
                break;
            }
            catch (Exception ex)
            {
                outputHelper.WriteLine($"⏳ [Admin Setup] Waiting for Auth Emulator (attempt {i+1}/{maxRetries})... Error: {ex.Message}");
                Log.Warning("⏳ [Admin Setup] Waiting for Auth Emulator (attempt {Attempt}/{MaxRetries})... Error: {Message}", i + 1, maxRetries, ex.Message);
                await Task.Delay(2000);
            }
        }

        try
        {
            var userArgs = new UserRecordArgs
            {
                Uid = adminUid,
                Email = "admin@localhost.com",
                Password = "admin123",
                EmailVerified = true
            };

            await auth.CreateUserAsync(userArgs);
            outputHelper.WriteLine($"✅ [Admin Setup] Created user: {adminUid}");
            Log.Information("✅ [Admin Setup] Created user: {AdminUid}", adminUid);
        }
        catch (Exception ex)
        {
            outputHelper.WriteLine(ex.ToString() + $"❌ [Admin Setup] Failed to create user: {adminUid}");
            Log.Error(ex, "❌ [Admin Setup] Failed to create user: {AdminUid}", adminUid);
        }
    }

    private static async Task<bool> IsEmulatorRunning(string host)
    {
        try
        {
            using var client = new System.Net.Http.HttpClient();
            client.Timeout = TimeSpan.FromSeconds(2);
            var response = await client.GetAsync($"http://{host}");
            return true;
        }
        catch
        {
            return false;
        }
    }
}
