namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api;
using Bibently.Application.Api.Clients;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public class BibentlyWebApplicationFactory : WebApplicationFactory<IApiMarker>
{
    public BibentlyWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT", "demo-no-project");
    }

    // Allows disabling the high test limits (e.g. for testing rate limiting scenarios)
    public bool UseHighRateLimits { get; set; } = true;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            if (UseHighRateLimits)
            {
                // Override rate limits to very high values so tests never hit 429 unintentionally.
                // The dedicated rate limit test uses its own factory with a low limit.
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["RateLimiting:Global:PermitLimit"] = "10000",
                    ["RateLimiting:Global:WindowMinutes"] = "1",
                    ["RateLimiting:Strict:PermitLimit"] = "10000",
                    ["RateLimiting:Strict:WindowMinutes"] = "1",
                });
            }
        });

        builder.ConfigureServices(services =>
        {
            services.AddSingleton<IPrivateServerClient, StubPrivateServerClient>();
        });
    }

    /// <summary>
    /// Stub PS client that mimics the external service by generating Id and CreatedAt locally.
    /// </summary>
    private sealed class StubPrivateServerClient : IPrivateServerClient
    {
        public Task<EventEntity> CreateEventAsync(CreateEventEntityRequest request, CancellationToken token)
        {
            var eventEntity = new EventEntity
            {
                Id = Guid.NewGuid(),
                Category = request.Category,
                Name = request.Name,
                Description = request.Description,
                ArticleBody = request.ArticleBody,
                Keywords = request.Keywords,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                DatePublished = request.DatePublished,
                Url = request.Url,
                ImageUrl = request.ImageUrl,
                EventStatus = request.EventStatus,
                AttendanceMode = request.AttendanceMode,
                Location = request.Location,
                Performer = request.Performer,
                Organizer = request.Organizer,
                Offer = request.Offer,
                Provider = request.Provider,
                CreatedAt = DateTime.UtcNow
            };

            return Task.FromResult(eventEntity);
        }
    }
}
