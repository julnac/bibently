namespace Bibently.Application.Options;

using System.ComponentModel.DataAnnotations;

public class EventsRepositoryOptions
{
    public const string SectionName = "EventsRepository";
    
    [Required]
    public string? ConnectionString { get; set; }
    
    [Required]
    public string? DatabaseName { get; set; }
}