// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="FirestoreEmulatorContainerFixture.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests.Fixtures;

using System;
using Testcontainers.Firestore;
using Testcontainers.Xunit;
using Xunit.Sdk;

public class FirestoreEmulatorContainerFixture(IMessageSink messageSink)
    : ContainerFixture<FirestoreBuilder, FirestoreContainer>(messageSink)
{
    protected override FirestoreBuilder Configure(FirestoreBuilder builder)
    {
        return builder
            .WithImage("gcr.io/google.com/cloudsdktool/cloud-sdk:emulators")
            .WithPortBinding(8080, 8080)
            .WithCommand("gcloud", "beta", "emulators", "firestore", "start", "--host-port=4000");
    }

    protected override async ValueTask InitializeAsync()
    {
        await base.InitializeAsync();
        Environment.SetEnvironmentVariable("FIRESTORE_EMULATOR_HOST", "localhost:8080");
    }
}
