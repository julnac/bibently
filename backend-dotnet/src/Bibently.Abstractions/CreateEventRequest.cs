namespace Bibently.Abstractions;

public class CreateEventRequest
{
    public required string Title { get; set; }
    public required DateTime Date { get; set; }
    public string? Location { get; set; }
    public required string Description { get; set; }
}