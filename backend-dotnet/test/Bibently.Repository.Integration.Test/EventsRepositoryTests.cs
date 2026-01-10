namespace Bibently.Repository.Integration.Test;

using Microsoft.Extensions.Configuration;
using Bibently.Repository.Models;
using AutoFixture;
using Bibently.Application.Installers;
using Microsoft.Extensions.DependencyInjection;
using Bibently.Tests.Shared;
using Xunit;

[Trait("Category", "Integration")]
public class EventsRepositoryTests: IClassFixture<MongoDbContainerFixture>
{
    private readonly Fixture _fixture = new Fixture();
    private readonly CancellationToken _token = CancellationToken.None;
    private readonly IEventsRepository _repository;
    
    public EventsRepositoryTests(MongoDbContainerFixture mongoDbContainerFixture)
    {
        var connectionString = mongoDbContainerFixture.Container.GetConnectionString();

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "EventsRepository:ConnectionString", connectionString },
                { "EventsRepository:DatabaseName", "BibentlyTestDb" }
            })
            .Build();
        
        var services = new ServiceCollection();
        services
            .AddAutoMapper()
            .AddMongo(configuration);

        var serviceProvider = services.BuildServiceProvider();
        _repository = serviceProvider.GetService<IEventsRepository>()!;
    }

    [Fact]
    public async Task GivenEvent_WhenInsertEvent_ThenEventIsInserted()
    {
        // Arrange
        var newEvent = _fixture.Create<EventDocument>();

        // Act
        await _repository.InsertEvent(newEvent, _token);

        // Assert
        var retrievedEvent = await _repository.GetEventById(newEvent.Id, _token);
        Assert.NotNull(retrievedEvent);
        Assert.Equal(newEvent.Id, retrievedEvent.Id);
    }

    [Fact]
    public async Task GivenEventsInDb_WhenGetEvents_ThenReturnsEvents()
    {
        // Arrange
        var newEvent1 = _fixture.Create<EventDocument>();
        var newEvent2 = _fixture.Create<EventDocument>();

        await _repository.InsertEvent(newEvent1, _token);
        await _repository.InsertEvent(newEvent2, _token);
        
        // Act
        var events = await _repository.GetEvents(_token);

        // Assert
        Assert.Contains(events, e => e.Id == newEvent1.Id);
        Assert.Contains(events, e => e.Id == newEvent2.Id);
    }
    
    [Fact]
    public async Task GivenEventInDb_WhenGetEventById_ThenReturnsEvent()
    {
        // Arrange
        var newEvent = _fixture.Create<EventDocument>();

        // Act
        await _repository.InsertEvent(newEvent, _token);

        // Assert
        var retrievedEvent = await _repository.GetEventById(newEvent.Id, _token);
        Assert.NotNull(retrievedEvent);
        Assert.Equal(newEvent.Id, retrievedEvent.Id);
    }
}