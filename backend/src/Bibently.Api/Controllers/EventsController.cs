using Bibently.Application.Models;
using Microsoft.AspNetCore.Mvc;

namespace Bibently.Application.Controllers;

[ApiController]
[Route("events")]
public class EventsController: ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        var mockedEvents = new Event[]
        {
            new Event
            {
                Title = "Sample Event 1",
                Date = DateTime.UtcNow.AddDays(10),
                Location = "New York",
                Description = "This is a sample event description."
            },
            new Event
            {
                Title = "Sample Event 2",
                Date = DateTime.UtcNow.AddDays(20),
                Location = "Los Angeles",
                Description = "This is another sample event description."
            }
        };
        return Ok(mockedEvents);
    }
}