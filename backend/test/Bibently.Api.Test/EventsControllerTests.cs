namespace Bibently.Api.Test;

using Bibently.Abstractions;
using Bibently.Application.Installers;
using Bibently.Application.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Bibently.Application.Controllers;
using Bibently.Application.Models;
using Microsoft.AspNetCore.Mvc;
using Xunit;

[Trait("Category", "Unit")]
public class EventsControllerTests
{
    private readonly Mock<IEventsService> _eventsService = new();
    private readonly CancellationToken _token = CancellationToken.None;
    private readonly EventsController _eventsController;

    public EventsControllerTests()
    {
        var mapper = AutoMapperInstaller.GetMapperConfiguration().CreateMapper();
        _eventsController = new EventsController(
            _eventsService.Object,
            new Mock<ILogger<EventsController>>().Object,
            mapper);
    }
    
    [Fact]
    public  async Task GivenEventsInService_WhenGetEvents_ThenReturnsEvents()
    {
        // Arrange
        const int expectedEventCount = 2;
        
        var eventEntities = new List<Event>
        {
            new Event { Id = Guid.NewGuid(), Title = "Event 1", Date = DateTime.UtcNow, Description = "Event 1", Location = "Location 1" },
            new Event { Id = Guid.NewGuid(), Title = "Event 2", Date = DateTime.UtcNow, Description = "Event 2", Location = "Location 2"  },
        };

        _eventsService.Setup(m => m.GetEvents(It.IsAny<CancellationToken>()))
            .ReturnsAsync(eventEntities);
        
        // Act
        var result = await _eventsController.GetEvents(_token);
        
        // Assert
        Assert.NotNull(result);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var events = Assert.IsType<List<EventDto>>(okResult.Value);
        Assert.Equal(expectedEventCount, events.Count);
    }
}