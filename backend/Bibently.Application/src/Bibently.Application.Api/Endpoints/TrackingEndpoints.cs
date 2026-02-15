namespace Bibently.Application.Api.Endpoints;

using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Services;
using Bibently.Application.Api.Validation;
using Microsoft.AspNetCore.Mvc;

public static class TrackingEndpoints
{
    public static void Map(IEndpointRouteBuilder app)
    {
        app.MapGet("/tracking/{id:guid}",
            async ([FromRoute] Guid id,
                    ITrackingService svc,
                    CancellationToken token) =>
            {
                var result = await svc.GetTrackingEventById(id, token);
                return result is null ? Results.NotFound() : Results.Ok(result);
            })
            .RequireAuthorization(nameof(Permission.ManageEvents));

        app.MapPost("/tracking",
            async ([FromBody] TrackingEvent dto,
                    ITrackingService svc,
                    CancellationToken token) =>
            {
                await svc.AddTrackingEvent(dto, token);
                return Results.Created($"/api/v1/tracking/{dto.Id}", dto);
            })
            .AllowAnonymous()
            .WithValidation<TrackingEvent>();

        app.MapDelete("/tracking/{id:guid}",
            async ([FromRoute] Guid id,
                    ITrackingService svc,
                    CancellationToken token) =>
            {
                // Check if tracking event exists before attempting delete
                var existingEvent = await svc.GetTrackingEventById(id, token);
                if (existingEvent is null)
                {
                    return Results.NotFound(new { error = $"Tracking event with ID '{id}' was not found." });
                }

                await svc.DeleteTrackingEventById(id, token);
                return Results.NoContent();
            })
            .RequireAuthorization(nameof(Permission.ManageEvents));
    }
}
