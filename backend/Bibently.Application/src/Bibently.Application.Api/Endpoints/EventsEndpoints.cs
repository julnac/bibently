namespace Bibently.Application.Api.Endpoints;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Services;
using Bibently.Application.Api.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

public static class EventsEndpoints
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/events",
            async ([AsParameters] FilterRequest filters,
                [AsParameters] SortRequest sorting,
                IEventsService svc,
                CancellationToken token) =>
            {
                var searchRequest = new SearchRequest
                {
                    Filters = filters,
                    Sorting = sorting
                };

                if (searchRequest.Sorting.PageSize > 100)
                {
                    searchRequest.Sorting.PageSize = 100;
                }

                return await svc.GetEvents(searchRequest, token);
            })
            .WithValidation<FilterRequest, SortRequest>()
            .RequireRateLimiting("Strict")
            .CacheOutput("EventsCache");

        app.MapPost("/events",
            async ([FromBody] EventEntity dto,
                    IEventsService svc,
                    IOutputCacheStore cacheStore,
                    CancellationToken token) =>
            {
                var result = await svc.AddEvent(dto, token);
                // Invalidate events cache when new event is added
                await cacheStore.EvictByTagAsync("events", token);
                return result;
            })
            .WithValidation<EventEntity>();

        app.MapPost("/events/bulk",
            async ([FromBody] List<EventEntity> dtos,
                IEventsService svc,
                IOutputCacheStore cacheStore,
                CancellationToken token) =>
            {
                await svc.AddEvents(dtos, token);
                // Invalidate events cache when events are added
                await cacheStore.EvictByTagAsync("events", token);
                return Results.Ok();
            })
            .WithValidation<List<EventEntity>>();

        app.MapDelete("/events/{id:guid}",
            async ([FromRoute] Guid id,
                IEventsService svc,
                IOutputCacheStore cacheStore,
                CancellationToken token) =>
            {
                // Check if event exists before attempting delete
                var existingEvent = await svc.GetEventById(id, token);
                if (existingEvent is null)
                {
                    return Results.NotFound(new { error = $"Event with ID '{id}' was not found." });
                }

                await svc.DeleteEventById(id, token);
                // Invalidate events cache when event is deleted
                await cacheStore.EvictByTagAsync("events", token);
                return Results.NoContent();
            });

        app.MapGet("/events/{id:guid}",
            async ([FromRoute] Guid id,
                IEventsService svc,
                CancellationToken token) =>
            {
                var eventEntity = await svc.GetEventById(id, token);
                return eventEntity is not null ? Results.Ok(eventEntity) : Results.NotFound();
            })
            .CacheOutput(policy => policy.Expire(TimeSpan.FromMinutes(5)).Tag("events"));
    }
}

