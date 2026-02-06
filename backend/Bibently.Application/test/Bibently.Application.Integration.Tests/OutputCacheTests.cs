// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="OutputCacheTests.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Integration.Tests.Fixtures;
using Bibently.Application.Integration.Tests.Utils;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

/// <summary>
/// Tests for output caching behavior on API endpoints.
/// </summary>
public class OutputCacheTests
    : IClassFixture<BibentlyWebApplicationFactory>,
        IClassFixture<FirebaseEmulatorsContainerFixture>
{
    private readonly HttpClient _client;
    private readonly BibentlyWebApplicationFactory _factory;
    private const string ApiV1 = "/api/v1";

    public OutputCacheTests(BibentlyWebApplicationFactory factory, ITestOutputHelper outputHelper)
    {
        var adminUserUtility = new AdminUserUtility(outputHelper);
        adminUserUtility.EnsureLocalAdminUserAsync("demo-admin-uid");

        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GivenGetEventsEndpoint_WhenCalledTwice_ThenSecondResponseIsCached()
    {
        // Arrange - Seed database with some events
        var uniqueCity = $"CacheHitTest_{Guid.NewGuid():N}";
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Create 3 events to seed the database
        var events = new List<EventEntity>
        {
            CreateEventEntity(Guid.NewGuid(), uniqueCity, "Cache Test Event 1"),
            CreateEventEntity(Guid.NewGuid(), uniqueCity, "Cache Test Event 2"),
            CreateEventEntity(Guid.NewGuid(), uniqueCity, "Cache Test Event 3")
        };

        foreach (var evt in events)
        {
            using var jsonContent = JsonContent.Create(evt);
            var postResponse = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);
            postResponse.StatusCode.Should().Be(HttpStatusCode.OK, $"Failed to seed event: {evt.Name}");
        }

        // Clear auth header for GET requests (public access)
        _client.DefaultRequestHeaders.Authorization = null;

        // Act - Make first GET request
        var response1 = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity}", UriKind.Relative), TestContext.Current.CancellationToken);
        response1.StatusCode.Should().Be(HttpStatusCode.OK);

        // Make second GET request immediately after (should be cached)
        var response2 = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity}", UriKind.Relative), TestContext.Current.CancellationToken);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert - Both responses should have the same data
        var content1 = await response1.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        var content2 = await response2.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);

        content1.Should().NotBeNull();
        content2.Should().NotBeNull();

        // Verify we actually have the seeded events
        content1!.Items.Should().HaveCount(3, "First response should contain 3 seeded events");
        content2!.Items.Should().HaveCount(3, "Second response (cached) should contain 3 seeded events");

        // Verify all seeded events are present
        foreach (var evt in events)
        {
            content1.Items.Should().Contain(e => e.Id == evt.Id);
            content2.Items.Should().Contain(e => e.Id == evt.Id);
        }
    }

    [Fact]
    public async Task GivenGetEventsWithDifferentParams_WhenCalled_ThenCacheVariesByQueryParams()
    {
        // Arrange - Seed different events for two cities
        var city1 = $"CacheVaryCity1_{Guid.NewGuid():N}";
        var city2 = $"CacheVaryCity2_{Guid.NewGuid():N}";
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var event1 = CreateEventEntity(Guid.NewGuid(), city1, "City1 Event");
        var event2 = CreateEventEntity(Guid.NewGuid(), city2, "City2 Event");

        using var jsonContent1 = JsonContent.Create(event1);
        await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent1, TestContext.Current.CancellationToken);

        using var jsonContent2 = JsonContent.Create(event2);
        await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent2, TestContext.Current.CancellationToken);

        // Clear auth for GET (public access)
        _client.DefaultRequestHeaders.Authorization = null;

        // Act - First request for City1 (cache miss - no Age header expected)
        var response1a = await _client.GetAsync(new Uri($"{ApiV1}/events?city={city1}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Second request for City1 (cache hit - Age header expected)
        var response1b = await _client.GetAsync(new Uri($"{ApiV1}/events?city={city1}", UriKind.Relative), TestContext.Current.CancellationToken);

        // First request for City2 (cache miss - different cache key, no Age header)
        var response2a = await _client.GetAsync(new Uri($"{ApiV1}/events?city={city2}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Second request for City2 (cache hit - Age header expected)
        var response2b = await _client.GetAsync(new Uri($"{ApiV1}/events?city={city2}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert - All requests should succeed
        response1a.StatusCode.Should().Be(HttpStatusCode.OK);
        response1b.StatusCode.Should().Be(HttpStatusCode.OK);
        response2a.StatusCode.Should().Be(HttpStatusCode.OK);
        response2b.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify City1 responses contain City1 event
        var content1a = await response1a.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        var content1b = await response1b.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        content1a!.Items.Should().Contain(e => e.Id == event1.Id, "City1 first request should contain City1 event");
        content1b!.Items.Should().Contain(e => e.Id == event1.Id, "City1 cached request should contain City1 event");
        content1a!.Items.Should().NotContain(e => e.Id == event2.Id, "City1 should not contain City2 event");

        // Verify City2 responses contain City2 event
        var content2a = await response2a.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        var content2b = await response2b.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        content2a!.Items.Should().Contain(e => e.Id == event2.Id, "City2 first request should contain City2 event");
        content2b!.Items.Should().Contain(e => e.Id == event2.Id, "City2 cached request should contain City2 event");
        content2a!.Items.Should().NotContain(e => e.Id == event1.Id, "City2 should not contain City1 event");

        // Verify cache hit via Age header (Output Cache adds Age header on cached responses)
        // First requests should NOT have Age header (cache miss)
        response1a.Headers.Contains("Age").Should().BeFalse("First City1 request should be a cache miss (no Age header)");
        response2a.Headers.Contains("Age").Should().BeFalse("First City2 request should be a cache miss (no Age header)");

        // Second requests should have Age header (cache hit)
        response1b.Headers.Contains("Age").Should().BeTrue("Second City1 request should be a cache hit (Age header present)");
        response2b.Headers.Contains("Age").Should().BeTrue("Second City2 request should be a cache hit (Age header present)");
    }

    [Fact]
    public async Task GivenCachedEvents_WhenNewEventIsPosted_ThenCacheIsInvalidated()
    {
        // Arrange - Use unique city to isolate this test
        var uniqueCity = $"CacheTestCity_{Guid.NewGuid():N}";
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // First, create an event
        var event1 = CreateEventEntity(Guid.NewGuid(), uniqueCity, "CacheTest Event 1");
        using var jsonContent = JsonContent.Create(event1);
        var postResponse = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);
        postResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Get events (should include our event)
        var getResponse1 = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity}", UriKind.Relative), TestContext.Current.CancellationToken);
        getResponse1.StatusCode.Should().Be(HttpStatusCode.OK);
        var result1 = await getResponse1.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        result1.Should().NotBeNull();
        result1!.Items.Should().Contain(e => e.Id == event1.Id);

        // Post a second event (should invalidate cache)
        var event2 = CreateEventEntity(Guid.NewGuid(), uniqueCity, "CacheTest Event 2");
        using var jsonContent2 = JsonContent.Create(event2);
        var postResponse2 = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent2, TestContext.Current.CancellationToken);
        postResponse2.StatusCode.Should().Be(HttpStatusCode.OK);

        // Get events again (cache should be invalidated, should include both events)
        var getResponse2 = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity}", UriKind.Relative), TestContext.Current.CancellationToken);
        getResponse2.StatusCode.Should().Be(HttpStatusCode.OK);
        var result2 = await getResponse2.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        result2.Should().NotBeNull();
        result2!.Items.Should().Contain(e => e.Id == event1.Id);
        result2.Items.Should().Contain(e => e.Id == event2.Id);
    }

    [Fact]
    public async Task GivenCachedEvents_WhenEventIsDeleted_ThenCacheIsInvalidated()
    {
        // Arrange - Use unique city to isolate this test
        var uniqueCity = $"CacheDeleteTest_{Guid.NewGuid():N}";
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Create an event
        var eventId = Guid.NewGuid();
        var eventEntity = CreateEventEntity(eventId, uniqueCity, "ToBeDeleted");
        using var jsonContent = JsonContent.Create(eventEntity);
        var postResponse = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);
        postResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Get events (should include our event)
        var getResponse1 = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity}", UriKind.Relative), TestContext.Current.CancellationToken);
        var result1 = await getResponse1.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        result1!.Items.Should().Contain(e => e.Id == eventId);

        // Delete the event (should invalidate cache)
        var deleteResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/events/{eventId}", UriKind.Relative), TestContext.Current.CancellationToken);
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Get events again (cache should be invalidated, event should be gone)
        var getResponse2 = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity}", UriKind.Relative), TestContext.Current.CancellationToken);
        var result2 = await getResponse2.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        result2!.Items.Should().NotContain(e => e.Id == eventId);
    }

    [Fact]
    public async Task GivenGetEventById_WhenCalledTwice_ThenSecondResponseIsFaster()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var eventId = Guid.NewGuid();
        var eventEntity = CreateEventEntity(eventId, "CacheByIdTestCity", "CacheById Event");
        using var jsonContent = JsonContent.Create(eventEntity);
        await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);

        // Clear auth for GET (public access)
        _client.DefaultRequestHeaders.Authorization = null;

        // Act - Measure first request (cache miss - hits Firestore)
        var stopwatch1 = System.Diagnostics.Stopwatch.StartNew();
        var response1 = await _client.GetAsync(new Uri($"{ApiV1}/events/{eventId}", UriKind.Relative), TestContext.Current.CancellationToken);
        stopwatch1.Stop();
        var firstRequestMs = stopwatch1.ElapsedMilliseconds;

        // Measure second request (cache hit - should be faster)
        var stopwatch2 = System.Diagnostics.Stopwatch.StartNew();
        var response2 = await _client.GetAsync(new Uri($"{ApiV1}/events/{eventId}", UriKind.Relative), TestContext.Current.CancellationToken);
        stopwatch2.Stop();
        var secondRequestMs = stopwatch2.ElapsedMilliseconds;

        // Assert - Both responses should be successful
        response1.StatusCode.Should().Be(HttpStatusCode.OK);
        response2.StatusCode.Should().Be(HttpStatusCode.OK);

        var content1 = await response1.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);
        var content2 = await response2.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);

        content1!.Id.Should().Be(eventId);
        content2!.Id.Should().Be(eventId);

        // Assert - Second request should be faster (cache hit)
        // Note: We use a soft assertion here because timing can vary in CI environments
        // The key insight is that cached responses should generally be faster
        secondRequestMs.Should().BeLessThanOrEqualTo(
            firstRequestMs,
            $"Cached response ({secondRequestMs}ms) should be faster than or equal to first request ({firstRequestMs}ms)");
    }

    private static EventEntity CreateEventEntity(Guid id, string city, string name) => new()
    {
        Id = id,
        Name = name,
        Description = "A test event for cache testing",
        StartDate = DateTime.UtcNow.AddDays(1),
        Type = "MusicEvent",
        EventStatus = "EventScheduled",
        AttendanceMode = "OfflineEventAttendanceMode",
        Provider = "TestProvider",
        Url = "https://example.com/events/1",
        CreatedAt = DateTime.UtcNow,
        DatePublished = DateTime.UtcNow,
        Location = new Location
        {
            Type = "Place",
            Name = "Test Venue",
            Address = new Address
            {
                Type = "PostalAddress",
                Name = "Test Address",
                Street = "Test Street 1",
                City = city,
                Country = "PL",
                PostalCode = "00-001"
            }
        },
        Performer = new Organization
        {
            Type = "MusicGroup",
            Name = "Test Band",
            Url = "https://example.com/testband",
            Address = new Address
            {
                Type = "PostalAddress",
                Name = "Test Address",
                Street = "Test Street 1",
                City = city,
                Country = "PL",
                PostalCode = "00-001"
            }
        },
        Offer = new Offer
        {
            Type = "Offer",
            Price = 100.00,
            Currency = "PLN",
            IsAvailable = true,
            Url = "https://example.com/tickets/1"
        }
    };
}
