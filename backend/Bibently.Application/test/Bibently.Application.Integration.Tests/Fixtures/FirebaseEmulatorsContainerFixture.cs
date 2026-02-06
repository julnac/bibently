// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="FirebaseEmulatorsContainerFixture.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests.Fixtures;

using System.IO;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Xunit;

public class FirebaseEmulatorsContainerFixture : IAsyncLifetime
{
    private readonly IContainer _container;
    private const int FirestorePort = 8080;
    private const int AuthPort = 9099;
    private const int UiPort = 4000;
    private const string GoogleProjectId = "demo-no-project";

    public string FirestoreHost => $"{_container.Hostname}:{_container.GetMappedPublicPort(FirestorePort)}";
    public string AuthHost => $"{_container.Hostname}:{_container.GetMappedPublicPort(AuthPort)}";

    public FirebaseEmulatorsContainerFixture()
    {
        var projectRoot = GetProjectRoot();

        _container = new ContainerBuilder()
            .WithImage("andreysenov/firebase-tools:latest")
            .WithBindMount(projectRoot, "/app")
            .WithWorkingDirectory("/app")
            .WithCommand("sh", "-c", $"firebase emulators:start --project {GoogleProjectId} --only firestore,auth")
            .WithPortBinding(FirestorePort, true)
            .WithPortBinding(AuthPort, true)
            .WithPortBinding(UiPort, true)
            .WithEnvironment("NODE_ENV", "development")
            .WithEnvironment("GOOGLE_CLOUD_PROJECT", GoogleProjectId)
            .WithWaitStrategy(Wait.ForUnixContainer()
                .UntilInternalTcpPortIsAvailable(AuthPort))
            .Build();
    }

    public async ValueTask InitializeAsync()
    {
        await _container.StartAsync();

        Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", FirestoreHost);
        Environment.SetEnvironmentVariable("FIREBASE_AUTH_EMULATOR_HOST", AuthHost);
    }

    public async ValueTask DisposeAsync()
    {
        await _container.StopAsync();
        await _container.DisposeAsync();
    }

    private static string GetProjectRoot()
    {
        var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (currentDir != null && !File.Exists(Path.Combine(currentDir.FullName, "firebase.json")))
        {
            currentDir = currentDir.Parent;
        }

        if (currentDir == null)
        {
            throw new InvalidOperationException("Could not find project root with firebase.json");
        }

        return currentDir.FullName;
    }
}
