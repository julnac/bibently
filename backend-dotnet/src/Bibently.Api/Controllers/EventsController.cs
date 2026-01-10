namespace Bibently.Application.Controllers;

using AutoMapper;
using Bibently.Abstractions;
using Bibently.Application.Models;
using Bibently.Application.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("events")]
public class EventsController(
    IEventsService eventsService,
    ILogger<EventsController> logger,
    IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEvents(CancellationToken token)
    {
        try
        {
            var events = await eventsService.GetEvents(token);
            return Ok(mapper.Map<List<EventDto>>(events));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to get events");
            throw;
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest createEventRequest, CancellationToken token)
    {
        try
        {
            var eventEntity = await eventsService.AddEvent(mapper.Map<Event>(createEventRequest), token);
            return Ok(mapper.Map<EventDto>(eventEntity));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to create event");
            return Problem();
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetEventById([FromRoute] Guid id, CancellationToken token)
    {
        try
        {
            var eventEntity = await eventsService.GetEventById(id, token);
            return Ok(mapper.Map<EventDto>(eventEntity));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to get event by id");
            return Problem();
        }
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEventById([FromRoute] Guid id, CancellationToken token)
    {
        try
        {
            await eventsService.DeleteEventById(id, token);
            return NoContent();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to delete event by id");
            return Problem();
        }
    }
}