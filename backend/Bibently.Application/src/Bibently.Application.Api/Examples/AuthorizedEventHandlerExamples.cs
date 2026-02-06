namespace Bibently.Application.Api.Examples;

using System;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Extensions;
using Bibently.Application.Api.Services;

/// <summary>
/// Example usage of the authorization middleware in event handlers.
/// This file demonstrates best practices for accessing authenticated user information.
///
/// NOTE: This is an example file - integrate these patterns into your actual endpoints.
/// </summary>
public static class AuthorizedEventHandlerExamples
{
    /// <summary>
    /// Example: Basic usage - simple handler with user context
    /// </summary>
    public static void ConfigureBasicExamples(WebApplication app)
    {
        // Example 1: Simple GET - User info available but not required
        app.MapGet("/events/example-get", async (HttpContext context, IEventsService svc, CancellationToken token) =>
        {
            // User info is available for logging/auditing even on public endpoints
            var userEmail = context.GetUserEmail();
            _ = context.GetUserId();

            if (context.IsAuthenticated())
            {
                Console.WriteLine($"Authenticated user {userEmail} accessed events");
            }
            else
            {
                Console.WriteLine("Public user accessed events");
            }

            return await svc.GetEvents(new SearchRequest { Filters = new(), Sorting = new() }, token);
        });

        // Example 2: GET with ID - may be called by authenticated users only
        app.MapGet("/events/example-get-by-id/{id}",
            async (Guid id, HttpContext context, IEventsService svc, CancellationToken token) =>
            {
                // This endpoint requires authentication (enforced by middleware for non-/events paths)
                var user = context.GetAuthenticatedUser();

                if (user != null)
                {
                    Console.WriteLine($"Event retrieved by {user.Email}");
                }

                return await svc.GetEventById(id, token);
            });
    }

    // /// <summary>
    // /// Example: Admin-only operations with audit logging
    // /// </summary>
    // public static void ConfigureAdminExamples(WebApplication app)
    // {
    //     // Example 3: POST - Admin only operation with audit trail
    //     app.MapPost("/events/example-admin-post",
    //         async (HttpContext context, EventEntity dto, IEventsService svc, CancellationToken token) =>
    //         {
    //             // Middleware already enforced that only admins reach here
    //             var user = context.GetAuthenticatedUser();
    //
    //             if (user == null)
    //             {
    //                 return Results.Unauthorized();
    //             }
    //
    //             // Log who created the event
    //             Console.WriteLine($"[AUDIT] Event created by admin {user.Email} (UID: {user.Uid})");
    //             Console.WriteLine($"[AUDIT] Event details created at {DateTime.UtcNow}");
    //
    //             var result = await svc.AddEvent(dto, token);
    //
    //             // Could also send to audit log service
    //             // await auditLogger.LogAsync(new AuditEntry
    //             // {
    //             //     Action = "CreateEvent",
    //             //     UserId = user.Uid,
    //             //     UserEmail = user.Email,
    //             //     Details = dto,
    //             //     Timestamp = DateTime.UtcNow
    //             // });
    //
    //             return result;
    //         });
    //
    //     // Example 4: DELETE - Admin only with confirmation
    //     app.MapDelete("/events/example-admin-delete/{id}",
    //         async (string id, HttpContext context, IEventsService svc, CancellationToken token) =>
    //         {
    //             var user = context.GetAuthenticatedUser();
    //
    //             if (user == null)
    //             {
    //                 return Results.Unauthorized();
    //             }
    //
    //             Console.WriteLine($"[AUDIT] Event {id} deleted by admin {user.Email}");
    //
    //             await svc.DeleteEventById(id, token);
    //
    //             return Results.NoContent();
    //         });
    // }

    /// <summary>
    /// Example: Using user info for resource ownership validation
    /// </summary>
    public static void ConfigureOwnershipExamples(WebApplication app)
    {
        // Example 5: Only allow users to update their own events
        app.MapPut("/events/example-user-update/{id}", async (string id, HttpContext context, CancellationToken token) =>
        {
            var user = context.GetAuthenticatedUser();

            if (user == null)
            {
                return Results.Unauthorized();
            }

            // Check if event belongs to user (would need to implement ownership check)
            // var eventDoc = await svc.GetEventById(id, token);
            // if (eventDoc.CreatedByUid != user.Uid && !isAdmin)
            // {
            //     return Results.Forbid();
            // }

            Console.WriteLine($"Event {id} updated by {user.Email}");

            return Results.Ok();
        });
    }
//
//     /// <summary>
//     /// Example: Role-based access control beyond admin
//     /// </summary>
//     public static async Task ConfigureRoleBasedExamples(WebApplication app, ILogger<EventsService> logger)
//     {
//         // Example 6: Check specific roles from claims
//         app.MapPost("/events/example-role-check", async (HttpContext context, EventEntity dto, IEventsService svc, CancellationToken token) : Task<IResult> =>
//         {
//             var user = context.GetAuthenticatedUser();
//
//             if (user == null)
//             {
//                 return Results.Unauthorized();
//             }
//
//             // Check if user has specific role in their claims
//             var role = context.GetUserClaim("role");
//
//             if (role?.ToString() != "EventManager")
//             {
//                 logger.LogWarning("User {Email} attempted to create event without EventManager role", user.Email);
//                 return Results.Forbid();
//             }
//
//             logger.LogInformation("Event created by {Email} with EventManager role", user.Email);
//
//             return await svc.AddEvent(dto, token);
//         });
//     }
//
//     /// <summary>
//     /// Example: Combining extension methods for cleaner code
//     /// </summary>
//     public static void ConfigureCleanCodeExamples(WebApplication app)
//     {
//         // Example 7: Using extension methods for cleaner, more readable code
//         app.MapPost("/events/example-clean-code", async (HttpContext context, EventEntity dto, IEventsService svc, CancellationToken token) : Task<IResult> =>
//         {
//             // Much cleaner using extension methods
//             if (!context.IsAuthenticated())
//             {
//                 return Results.Unauthorized();
//             }
//
//             var userEmail = context.GetUserEmail();
//
//             Console.WriteLine($"Event created by {userEmail}");
//
//             return await svc.AddEvent(dto, token);
//         });
//     }
// }

    /// <summary>
    /// Example service showing how to audit operations with user information.
    /// </summary>
    /// <summary>
    /// Example service showing how to audit operations with user information.
    /// </summary>
    internal interface IAuditLogger
    {
        Task LogAsync(AuditEntry entry, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Audit log entry for tracking user actions.
    /// </summary>
    internal class AuditEntry
    {
        public required string Action { get; init; }
        public required string UserId { get; init; }
        public required string UserEmail { get; init; }
        public object? Details { get; init; }
        public required DateTime Timestamp { get; init; }
    }

    /// <summary>
    /// Example implementation of audit logger.
    /// </summary>
    internal class ConsoleAuditLogger : IAuditLogger
    {
        private readonly ILogger<ConsoleAuditLogger> _logger;

        public ConsoleAuditLogger(ILogger<ConsoleAuditLogger> logger)
        {
            _logger = logger;
        }

        public Task LogAsync(AuditEntry entry, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "AUDIT: {Action} by {UserEmail} (UID: {UserId}) at {Timestamp}",
                entry.Action,
                entry.UserEmail,
                entry.UserId,
                entry.Timestamp
            );

            return Task.CompletedTask;
        }
    }
}
