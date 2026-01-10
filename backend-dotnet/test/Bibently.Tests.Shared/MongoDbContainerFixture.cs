using Testcontainers.MongoDb;
using Testcontainers.Xunit;
using Xunit.Sdk;

namespace Bibently.Tests.Shared;

public sealed class MongoDbContainerFixture(IMessageSink messageSink)
    : ContainerFixture<MongoDbBuilder, MongoDbContainer>(messageSink)
{
    protected override async ValueTask InitializeAsync()
    {
        await base.InitializeAsync();
        Environment.SetEnvironmentVariable("MarketingStudioRepository__ConnectionString", Container.GetConnectionString());
    }
}