namespace Bibently.Application.Models;

public class Event
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required DateTime Date { get; set; }
    public required string Location { get; set; }
    public required string Description { get; set; }
}