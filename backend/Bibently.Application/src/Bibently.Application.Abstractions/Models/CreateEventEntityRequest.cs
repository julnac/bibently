namespace Bibently.Application.Abstractions.Models;

public class CreateEventEntityRequest
{
    public required string Category { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? ArticleBody { get; set; }
    public List<string> Keywords { get; set; } = [];
    public required DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public required DateTime DatePublished { get; set; }
    public required string Url { get; set; }
    public string? ImageUrl { get; set; }
    public required string EventStatus { get; set; }
    public required string AttendanceMode { get; set; }
    public required Location Location { get; set; }
    public required Organization Performer { get; set; }
    public Organization? Organizer { get; set; }
    public required Offer Offer { get; set; }
    public required string Provider { get; set; }
}
