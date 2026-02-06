namespace Bibently.Application.Abstractions.Models;

public class TrackingEvent
{
    public required Guid Id { get; set; }

    public required string Action { get; set; }

    public required Guid UserId { get; set; }

    public string Payload { get; set; } = string.Empty;

    public string UserAgent { get; set; } = string.Empty;

    public string UserLocation { get; set; } = string.Empty;

    public string FrontendVersion { get; set; } = string.Empty;

    public required DateTime CreatedAt { get; set; }
}
