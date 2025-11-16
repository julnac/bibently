namespace Bibently.Repository.Models;

public class EventDocument
{
    public Guid Id { get; set; }
    public long Version { get; set; }
    
    public required string Title { get; set; }
    public required DateTime Date { get; set; }
    public required string Location { get; set; }
    public required string Description { get; set; }
}