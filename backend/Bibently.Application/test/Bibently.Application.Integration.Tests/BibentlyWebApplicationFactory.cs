namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api;
using Bibently.Application.Api.Clients;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

public class BibentlyWebApplicationFactory : WebApplicationFactory<IApiMarker>
{
    public BibentlyWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT", "demo-no-project");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

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
                Type = request.Type,
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
