using Bibently.Application.Controllers;
using Bibently.Application.Models;
using Microsoft.AspNetCore.Mvc;

namespace Bibently.Api.Test;

public class EventsControllerTests
{
    private readonly EventsController _eventsController = new();
    
    [Fact]
    public  async Task Test1()
    {
        // Arrange
        const int expectedEventCount = 2;
        
        // Act
        var result = await _eventsController.GetEvents();
        
        // Assert
        Assert.NotNull(result);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var events = Assert.IsType<Event[]>(okResult.Value);
        Assert.Equal(expectedEventCount, events.Length);
    }
}