// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="FirebaseInstaller.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Installers;

using FirebaseAdmin;
using Google.Api.Gax;
using Google.Api.Gax.Grpc;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Microsoft.Extensions.DependencyInjection;
using Bibently.Application.Api.Services;

public static class FirebaseInstaller
{
    public static IServiceCollection AddFirebase(this IServiceCollection services, bool isDevelopment)
    {
        var projectId = Environment.GetEnvironmentVariable("GOOGLE_CLOUD_PROJECT") ?? throw new InvalidOperationException("Missing environment variable GOOGLE_CLOUD_PROJECT");

        services.AddSingleton(sp =>
        {
            var firebaseApp = FirebaseApp.DefaultInstance ?? FirebaseApp.Create(new AppOptions
            {
                Credential = isDevelopment
                    ? GoogleCredential.FromAccessToken("dummy-access-token")
                    : GoogleCredential.GetApplicationDefault(),
                ProjectId = projectId
            });
            return firebaseApp;
        });

        services.AddSingleton(_ =>
        {
            var firestoreClientBuilder = new FirestoreClientBuilder
            {
                Settings = new FirestoreSettings
                {
                    CallSettings = CallSettings.FromExpiration(Expiration.FromTimeout(TimeSpan.FromSeconds(10)))
                }
            };

            // In development, ensure we connect to the local emulator if the env var is missing
            if (isDevelopment)
            {
                if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST")))
                {
                    Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", "localhost:8080");
                }

                var emulatorHost = Environment.GetEnvironmentVariable("FIRESTORE_EMULATOR_HOST");
                if (!string.IsNullOrEmpty(emulatorHost))
                {
                    firestoreClientBuilder.Endpoint = emulatorHost;
                    firestoreClientBuilder.ChannelCredentials = Grpc.Core.ChannelCredentials.Insecure;

                    // Use CallSettings to inject the admin token as a header.
                    // This avoids the 'InvalidOperationException' when combining CallCredentials with insecure channels.
                    firestoreClientBuilder.Settings.CallSettings = CallSettings.FromHeader("Authorization", "Bearer owner")
                        .MergedWith(firestoreClientBuilder.Settings.CallSettings);

                    Console.WriteLine($"ℹ️ [Firestore] Connecting to emulator at {emulatorHost}");
                }
            }

            var firestoreClient = firestoreClientBuilder.Build();

            return FirestoreDb.Create(projectId, firestoreClient);
        });

        services.AddSingleton<IFirebaseAuthService, FirebaseAuthService>();

        return services;
    }
}
