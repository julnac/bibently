// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="ProgramTests.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Integration.Tests;

using Bibently.Application.Abstractions.Models;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Bibently.Application.Integration.Tests.Fixtures;
using Bibently.Application.Integration.Tests.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Repository = Bibently.Application.Repository;

public class ProgramTests
    : IClassFixture<BibentlyWebApplicationFactory>,
        IClassFixture<FirebaseEmulatorsContainerFixture>,
        IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly BibentlyWebApplicationFactory _factory;
    private readonly ITestOutputHelper _outputHelper;

    // API v1 base path for versioned endpoints
    private const string ApiV1 = "/api/v1";

    public ProgramTests(BibentlyWebApplicationFactory factory, ITestOutputHelper outputHelper)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _outputHelper = outputHelper;
    }

    public async ValueTask InitializeAsync()
    {
        var adminUserUtility = new AdminUserUtility(_outputHelper);
        await adminUserUtility.EnsureLocalAdminUserAsync("demo-admin-uid");
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task GivenValidEvent_WhenPostEvent_ThenEventIsSavedToDb()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var @event = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Test Concert");

        // Act - Post the event (server generates Id)
        var createdEvent = await PostEventAsync(@event);

        // Act - Get the event back to verify it's in the DB
        var uri = new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative);
        var getResponse = await _client.GetAsync(uri, TestContext.Current.CancellationToken);

        // Assert Get Response
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var savedEvent = await getResponse.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);

        savedEvent.Should().NotBeNull();
        savedEvent!.Id.Should().Be(createdEvent.Id);
        savedEvent.Name.Should().Be(@event.Name);
    }

    [Fact]
    public async Task GivenValidFilter_WhenGetEvents_ThenReturnsFilteredResults()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Use unique city names to isolate this test from other tests
        var uniqueCity1 = $"FilterTestCity_{Guid.NewGuid():N}";
        var uniqueCity2 = $"ExcludedCity_{Guid.NewGuid():N}";

        var created1 = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), uniqueCity1, "Concert A"));
        var created2 = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), uniqueCity2, "Concert B"));

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/events?city={uniqueCity1}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        result.Should().NotBeNull();
        result!.Items.Should().ContainSingle(i => i.Id == created1.Id, "Only the event in our unique city should be found");
        result.Items.Should().NotContain(i => i.Id == created2.Id, "Event in different city should NOT be in filtered results");
    }

    [Fact]
    public async Task GivenListOfEvents_WhenPostBulk_ThenAllEventsAreSaved()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var events = new List<EventEntity>
        {
            CreateEventEntity(Guid.NewGuid(), "Warsaw", "Bulk Event 1"),
            CreateEventEntity(Guid.NewGuid(), "Warsaw", "Bulk Event 2")
        };

        // Act
        using var eventsJson = JsonContent.Create(events);
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events/bulk", UriKind.Relative), eventsJson, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        foreach (var @event in events)
        {
            var getResponse = await _client.GetAsync(new Uri($"{ApiV1}/events/{@event.Id}", UriKind.Relative), TestContext.Current.CancellationToken);
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
    [Fact]
    public async Task Given101Events_WhenGetEventsWithBigPageSize_ThenReturnsMax100Items()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Create 101 events
        using var eventsJsonContent = JsonContent.Create(Enumerable.Range(0, 101)
            .Select(i => CreateEventEntity(Guid.NewGuid(), "Warsaw", $"Bulk {i}")));

        // We use bulk endpoint to setup data efficiently (limit is 500 so 101 is fine)
        await _client.PostAsync(new Uri($"{ApiV1}/events/bulk", UriKind.Relative), eventsJsonContent, TestContext.Current.CancellationToken);

        // Act
        // Request 200 items, should be cap at 100
        var response = await _client.GetAsync(new Uri($"{ApiV1}/events?pageSize=200&city=Warsaw", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(100); // Expecting exactly 100 items (the limit)
        result.NextPageToken.Should().NotBeNullOrEmpty(); // Should have next page for the 101st item
    }

    [Fact]
    public async Task GivenTooManyEvents_WhenPostBulk_ThenReturnsBadRequest()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Create 501 events
        using var eventsJsonContent = JsonContent.Create(Enumerable.Range(0, 501)
            .Select(i => CreateEventEntity(Guid.NewGuid(), "Warsaw", $"Bulk {i}")));

        // Act
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events/bulk", UriKind.Relative), eventsJsonContent, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        content.Should().Contain("500");
    }
    [Fact]
    public async Task GivenExistingEvent_WhenDeleteEvent_ThenEventIsRemoved()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var createdEvent = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), "Warsaw", "To Delete"));

        // Act
        var deleteResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getResponse = await _client.GetAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative), TestContext.Current.CancellationToken);
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GivenNonExistingEvent_WhenDeleteEvent_ThenReturnsNotFound()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var nonExistentEventId = Guid.NewGuid();

        // Act
        var deleteResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/events/{nonExistentEventId}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GivenTrackingEvent_WhenPostAndGet_ThenTrackingDataIsCorrect()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var trackingId = Guid.NewGuid();
        var trackingEvent = new TrackingEvent
        {
            Id = trackingId,
            Action = "TestClick",
            UserId = Guid.NewGuid(),
            Payload = "testPayload",
            UserAgent = "testAgent",
            CreatedAt = DateTime.UtcNow
        };

        // Act - Create
        using var trackingJson = JsonContent.Create(trackingEvent);
        var postResponse = await _client.PostAsync(new Uri($"{ApiV1}/tracking", UriKind.Relative), trackingJson, TestContext.Current.CancellationToken);
        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        // Act - Get
        var getResponse = await _client.GetAsync(new Uri($"{ApiV1}/tracking/{trackingId}", UriKind.Relative), TestContext.Current.CancellationToken);
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var savedTracking = await getResponse.Content.ReadFromJsonAsync<TrackingEvent>(TestContext.Current.CancellationToken);
        savedTracking.Should().NotBeNull();
        savedTracking!.Id.Should().Be(trackingId);
        savedTracking.Action.Should().Be("TestClick");

        // Act - Delete
        var deleteResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/tracking/{trackingId}", UriKind.Relative), TestContext.Current.CancellationToken);
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getAfterDelete = await _client.GetAsync(new Uri($"{ApiV1}/tracking/{trackingId}", UriKind.Relative), TestContext.Current.CancellationToken);
        getAfterDelete.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GivenNonExistingTrackingEvent_WhenDelete_ThenReturnsNotFound()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var nonExistentTrackingId = Guid.NewGuid();

        // Act
        var deleteResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/tracking/{nonExistentTrackingId}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GivenInvalidEvent_WhenPostEvent_ThenReturnsBadRequest()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var invalidEvent = new EventEntity
        {
            Id = Guid.NewGuid(),
            Category = "InvalidEventType", // Invalid event type
            Name = "", // Empty name - validation should fail
            Description = "Test",
            StartDate = DateTime.UtcNow.AddDays(1),
            DatePublished = DateTime.UtcNow,
            Url = "not-a-valid-url", // Invalid URL
            EventStatus = "EventScheduled",
            AttendanceMode = "OfflineEventAttendanceMode",
            Provider = "TestProvider",
            CreatedAt = DateTime.UtcNow,
            Location = new Location
            {
                Type = "Place",
                Name = "Test Venue",
                Address = new Address { Type = "PostalAddress", Name = "Addr", City = "City", Country = "PL" }
            },
            Performer = new Organization
            {
                Type = "MusicGroup",
                Name = "Test Band",
                Url = "https://example.com/testband",
                Address = new Address { Type = "PostalAddress", Name = "Addr", City = "City", Country = "PL" }
            },
            Offer = new Offer
            {
                Type = "Offer",
                Price = 100,
                Currency = "PLN",
                Url = "https://example.com/tickets/1",
                IsAvailable = true
            }
        };

        using var jsonContent = JsonContent.Create(invalidEvent);

        // Act
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GivenMultipleInequalityFilters_WhenGetEvents_ThenItShouldWork()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var event1 = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Cheap Late Event");
        event1.Offer = new Offer
        {
            Type = "Offer",
            Price = 50,
            Currency = "PLN",
            Url = "https://example.com/tickets/1",
            IsAvailable = true
        };
        event1.StartDate = DateTime.UtcNow.AddDays(10);

        var event2 = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Expensive Late Event");
        event2.Offer = new Offer
        {
            Type = "Offer",
            Price = 150,
            Currency = "PLN",
            Url = "https://example.com/tickets/1",
            IsAvailable = true
        };
        event2.StartDate = DateTime.UtcNow.AddDays(10);

        var event3 = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Cheap Early Event");
        event3.Offer = new Offer
        {
            Type = "Offer",
            Price = 50,
            Currency = "PLN",
            Url = "https://example.com/tickets/1",
            IsAvailable = true
        };
        event3.StartDate = DateTime.UtcNow.AddDays(1);

        await PostEventAsync(event1);
        var created2 = await PostEventAsync(event2);
        await PostEventAsync(event3);

        // Act - Query with Price > 100 AND Create Date > Now + 5 days
        // MinPrice = 100 (inequality on offer.price)
        // StartDate = Now + 5d (inequality on startDate)
        var minDate = DateTime.UtcNow.AddDays(5).ToString("O");
        var uri = $"{ApiV1}/events?minPrice=100&startDate={minDate}";

        var response = await _client.GetAsync(new Uri(uri, UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);
        result.Should().NotBeNull();
        // Should only contain event2 (Price 150 > 100, Date +10 > +5)
        result!.Items.Should().ContainSingle(i => i.Id == created2.Id);
    }

    [Fact]
    public async Task GivenTooManyRequests_WhenGetEvents_ThenStrictRateLimitIsTriggered()
    {
        // Use a dedicated factory class so we don't lose configuration through WithWebHostBuilder
        await using var rateLimitFactory = new RateLimitFactory();
        using var isolatedClient = rateLimitFactory.CreateClient();

        var token = TokenTool.Generate("demo-admin-uid");
        isolatedClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act - exhaust the low limit (5) + buffer
        // We need enough requests to definitely trip the limit
        var limitEncountered = false;
        for (int i = 0; i < 30; i++)
        {
            var response = await isolatedClient.GetAsync(new Uri($"{ApiV1}/events", UriKind.Relative), TestContext.Current.CancellationToken);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                limitEncountered = true;
                break;
            }
        }

        // Assert
        limitEncountered.Should().BeTrue("Should hit 429 TooManyRequests after exceeding the strict limit");
    }

    private sealed class RateLimitFactory : BibentlyWebApplicationFactory
    {
        public RateLimitFactory()
        {
            // IMPORTANT: Disable the high test limits from the base class so our low limit works
            UseHighRateLimits = false;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Call base to get PrivateServer setup which runs BEFORE our custom configuration here
            base.ConfigureWebHost(builder);

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["RateLimiting:Strict:PermitLimit"] = "5",
                    ["RateLimiting:Strict:WindowMinutes"] = "1",
                });
            });
        }
    }

    [Fact]
    public async Task GivenExistingEvent_WhenAttend_ThenAttendeeCountIsIncremented()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var createdEvent = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), "Warsaw", "Attend Test Event"));

        // Act
        var attendResponse = await _client.PostAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);

        // Assert
        attendResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await _client.GetAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative), TestContext.Current.CancellationToken);
        var savedEvent = await getResponse.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);
        savedEvent.Should().NotBeNull();
        savedEvent!.AttendeeCount.Should().Be(1);
    }

    [Fact]
    public async Task GivenExistingEvent_WhenUnattend_ThenAttendeeCountIsDecremented()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var createdEvent = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), "Warsaw", "Unattend Test Event"));

        // First attend twice
        await _client.PostAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);
        await _client.PostAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);

        // Act - unattend once
        var unattendResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        unattendResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await _client.GetAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative), TestContext.Current.CancellationToken);
        var savedEvent = await getResponse.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);
        savedEvent.Should().NotBeNull();
        savedEvent!.AttendeeCount.Should().Be(1);
    }

    [Fact]
    public async Task GivenExistingEvent_WhenMultipleAttends_ThenAttendeeCountAccumulates()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var createdEvent = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), "Warsaw", "Multi Attend Event"));

        // Act - attend 3 times
        await _client.PostAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);
        await _client.PostAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);
        await _client.PostAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);

        // Assert
        var getResponse = await _client.GetAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative), TestContext.Current.CancellationToken);
        var savedEvent = await getResponse.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);
        savedEvent.Should().NotBeNull();
        savedEvent!.AttendeeCount.Should().Be(3);
    }

    [Fact]
    public async Task GivenNonExistingEvent_WhenAttend_ThenReturnsNotFound()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var nonExistentEventId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events/{nonExistentEventId}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GivenUnauthenticatedUser_WhenAttend_ThenReturnsUnauthorized()
    {
        // Arrange - clear auth header
        _client.DefaultRequestHeaders.Authorization = null;
        var eventId = Guid.NewGuid();

        // Act
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events/{eventId}/attend", UriKind.Relative), null, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // --- RBAC Tests ---

    [Fact]
    public async Task GivenRegularUser_WhenPostEvent_ThenReturnsOk()
    {
        // Arrange - token with no role claim (server defaults to User)
        var token = TokenTool.Generate("demo-user-uid", new Dictionary<string, object>());
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var @event = CreateEventEntity(Guid.NewGuid(), "Warsaw", "User Created Event");

        // Act
        using var jsonContent = JsonContent.Create(@event);
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);

        // Assert - WriteEvents policy allows User role
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GivenAnonymous_WhenPostEvent_ThenReturnsUnauthorized()
    {
        // Arrange - no auth header
        _client.DefaultRequestHeaders.Authorization = null;

        var @event = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Anonymous Event");

        // Act
        using var jsonContent = JsonContent.Create(@event);
        var response = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GivenRegularUser_WhenDeleteEvent_ThenReturnsForbidden()
    {
        // Arrange - create event as admin first
        var adminToken = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);
        var createdEvent = await PostEventAsync(CreateEventEntity(Guid.NewGuid(), "Warsaw", "Admin Event For User Delete Test"));

        // Switch to regular user
        var userToken = TokenTool.Generate("demo-user-uid", new Dictionary<string, object>());
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userToken);

        // Act
        var deleteResponse = await _client.DeleteAsync(new Uri($"{ApiV1}/events/{createdEvent.Id}", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert - ManageEvents policy requires Admin
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GivenRegularUser_WhenGetPermissions_ThenReturnsCorrectFlags()
    {
        // Arrange - token with no role claim (server defaults to User)
        var token = TokenTool.Generate("demo-user-uid", new Dictionary<string, object>());
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var permissions = await response.Content.ReadFromJsonAsync<UserPermissionsResponse>(TestContext.Current.CancellationToken);
        permissions.Should().NotBeNull();
        permissions!.Role.Should().Be("User");
        permissions.IsPremium.Should().BeFalse();
        permissions.Features.CanCreateEvents.Should().BeTrue();
        permissions.Features.CanDeleteAnyEvent.Should().BeFalse();
        permissions.Features.CanBulkImport.Should().BeFalse();
        permissions.Features.CanAccessVipEvents.Should().BeFalse();
    }

    [Fact]
    public async Task GivenAdmin_WhenGetPermissions_ThenReturnsAllFlagsTrue()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var permissions = await response.Content.ReadFromJsonAsync<UserPermissionsResponse>(TestContext.Current.CancellationToken);
        permissions.Should().NotBeNull();
        permissions!.Role.Should().Be("Admin");
        permissions.Features.CanCreateEvents.Should().BeTrue();
        permissions.Features.CanDeleteAnyEvent.Should().BeTrue();
        permissions.Features.CanBulkImport.Should().BeTrue();
    }

    [Fact]
    public async Task GivenAnonymous_WhenGetPermissions_ThenReturnsUnauthorized()
    {
        // Arrange - no auth
        _client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // --- User Document Storage Tests ---

    [Fact]
    public async Task GivenAdmin_WhenGetPermissions_ThenUserDocumentIsCreatedInFirestore()
    {
        // Arrange
        var uid = $"admin-doc-test-{Guid.NewGuid():N}";
        var token = TokenTool.Generate(uid);
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert - verify user document was created in Firestore
        using var scope = _factory.Services.CreateScope();
        var usersRepo = scope.ServiceProvider.GetRequiredService<Repository.IUsersRepository>();
        var userDoc = await usersRepo.GetUserByUid(uid, TestContext.Current.CancellationToken);

        userDoc.Should().NotBeNull();
        userDoc!.Uid.Should().Be(uid);
        userDoc.Role.Should().Be("Admin");
        userDoc.Email.Should().Be("test-user@example.com");
        userDoc.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        userDoc.LastSeenAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
    }

    [Fact]
    public async Task GivenRegularUser_WhenGetPermissions_ThenUserDocumentHasUserRole()
    {
        // Arrange - no role claim → defaults to User
        var uid = $"user-doc-test-{Guid.NewGuid():N}";
        var token = TokenTool.Generate(uid, new Dictionary<string, object>());
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert
        using var scope = _factory.Services.CreateScope();
        var usersRepo = scope.ServiceProvider.GetRequiredService<Repository.IUsersRepository>();
        var userDoc = await usersRepo.GetUserByUid(uid, TestContext.Current.CancellationToken);

        userDoc.Should().NotBeNull();
        userDoc!.Role.Should().Be("User");
        userDoc.IsPremium.Should().BeFalse();
    }

    [Fact]
    public async Task GivenExistingUser_WhenGetPermissionsAgain_ThenLastSeenAtIsUpdated()
    {
        // Arrange - first call to create the document
        var uid = $"lastseen-test-{Guid.NewGuid():N}";
        var token = TokenTool.Generate(uid);
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);

        using var scope1 = _factory.Services.CreateScope();
        var usersRepo = scope1.ServiceProvider.GetRequiredService<Repository.IUsersRepository>();
        var firstDoc = await usersRepo.GetUserByUid(uid, TestContext.Current.CancellationToken);
        firstDoc.Should().NotBeNull();
        var firstLastSeen = firstDoc!.LastSeenAt;

        // Wait briefly to ensure timestamps differ
        await Task.Delay(100, TestContext.Current.CancellationToken);

        // Act - second call
        await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert - LastSeenAt should be updated, CreatedAt should be preserved
        using var scope2 = _factory.Services.CreateScope();
        var usersRepo2 = scope2.ServiceProvider.GetRequiredService<Repository.IUsersRepository>();
        var secondDoc = await usersRepo2.GetUserByUid(uid, TestContext.Current.CancellationToken);

        secondDoc.Should().NotBeNull();
        secondDoc!.LastSeenAt.Should().BeOnOrAfter(firstLastSeen);
        secondDoc.CreatedAt.Should().Be(firstDoc.CreatedAt);
    }

    [Fact]
    public async Task GivenPremiumUser_WhenGetPermissions_ThenUserDocumentHasPremiumFlag()
    {
        // Arrange
        var uid = $"premium-doc-test-{Guid.NewGuid():N}";
        var token = TokenTool.Generate(uid, new Dictionary<string, object>
        {
            { "role", "admin" },
            { "premium_attendee", true }
        });
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync(new Uri($"{ApiV1}/me/permissions", UriKind.Relative), TestContext.Current.CancellationToken);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert
        using var scope = _factory.Services.CreateScope();
        var usersRepo = scope.ServiceProvider.GetRequiredService<Repository.IUsersRepository>();
        var userDoc = await usersRepo.GetUserByUid(uid, TestContext.Current.CancellationToken);

        userDoc.Should().NotBeNull();
        userDoc!.IsPremium.Should().BeTrue();
    }

    [Fact]
    public async Task GivenEventsWithKeywords_WhenFilterByCommaSeparatedKeywords_ThenReturnsMatchingEvents()
    {
        // Arrange
        var token = TokenTool.Generate("demo-admin-uid");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var event1 = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Tennis Match");
        event1.Keywords = ["Sport", "Tennis"];
        event1 = await PostEventAsync(event1);

        var event2 = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Photo Exhibition");
        event2.Keywords = ["Art", "Photography"];
        event2 = await PostEventAsync(event2);

        var event3 = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Coding Meetup");
        event3.Keywords = ["Tech", "Coding"];
        event3 = await PostEventAsync(event3);

        // Act - Filter with comma-separated keywords "Tennis,Photography"
        // This simulates how Scalar/Swagger UI sends array parameters or how a user might type them
        var uri = $"{ApiV1}/events?keywords=Tennis,Photography";
        var response = await _client.GetAsync(new Uri(uri, UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        // Should find event1 (Tennis) and event2 (Photography), but NOT event3 (Coding)
        // Note: The logic in FirestoreEventsRepository uses array-contains-any, so ANY match is sufficient.
        result!.Items.Should().Contain(e => e.Id == event1.Id);
        result.Items.Should().Contain(e => e.Id == event2.Id);
        result.Items.Should().NotContain(e => e.Id == event3.Id);
    }

    // --- Geolocation Filtering Tests ---

    [Fact]
    public async Task GivenEventsAtDifferentDistances_WhenFilterByRadius_ThenReturnsOnlyEventsInRadius()
    {
        // Arrange
        var token = TokenTool.Generate("admin-geo-test");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Center point: 52.00, 21.00
        double centerLat = 52.00;
        double centerLng = 21.00;

        // Event A: ~5km North (52.045, 21.00)
        var sourceA = CreateEventEntity(Guid.NewGuid(), "LocA", "Inside Radius", 52.045, 21.00);
        var eventInside = await PostEventAsync(sourceA);

        // Event B: ~15km North (52.135, 21.00)
        var sourceB = CreateEventEntity(Guid.NewGuid(), "LocB", "Outside Radius", 52.135, 21.00);
        var eventOutside = await PostEventAsync(sourceB);

        // Act - Filter with 10km radius
        var uri = $"{ApiV1}/events?latitude={centerLat}&longitude={centerLng}&radiusKm=10";

        var response = await _client.GetAsync(new Uri(uri, UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();

        result!.Items.Should().Contain(e => e.Id == eventInside.Id);
        result.Items.Should().NotContain(e => e.Id == eventOutside.Id);
    }

    [Fact]
    public async Task GivenEventsInDifferentCities_WhenFilterByGeo_ThenReturnsCorrectCityEvent()
    {
        // Arrange
        var token = TokenTool.Generate("admin-geo-city-test");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Warsaw Event (52.2297, 21.0122)
        var sourceWarsaw = CreateEventEntity(Guid.NewGuid(), "Warsaw", "Warsaw Event", 52.2297, 21.0122);
        var warsawEvent = await PostEventAsync(sourceWarsaw);

        // Gdańsk Event (54.3520, 18.6466)
        var sourceGdansk = CreateEventEntity(Guid.NewGuid(), "Gdańsk", "Gdańsk Event", 54.3520, 18.6466);
        var gdanskEvent = await PostEventAsync(sourceGdansk);

        // Act - Filter around Warsaw (5km radius)
        var uri = $"{ApiV1}/events?latitude=52.2297&longitude=21.0122&radiusKm=5";
        var response = await _client.GetAsync(new Uri(uri, UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Items.Should().Contain(e => e.Id == warsawEvent.Id);
        result.Items.Should().NotContain(e => e.Id == gdanskEvent.Id);
    }

    [Fact]
    public async Task GivenEventWithinDefaultRadius_WhenFilterWithoutRadius_ThenUsesDefault10Km()
    {
        // Arrange - Default radius is 10km
        var token = TokenTool.Generate("admin-geo-default-test");
        _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        double centerLat = 52.00;
        double centerLng = 21.00;

        // Event ~5km away (inside default 10km)
        var sourceInside = CreateEventEntity(Guid.NewGuid(), "LocDefault", "Inside Default Radius", 52.045, 21.00);
        var eventInside = await PostEventAsync(sourceInside);

        // Act - Filter with lat/lng only (no radiusKm)
        var uri = $"{ApiV1}/events?latitude={centerLat}&longitude={centerLng}";
        var response = await _client.GetAsync(new Uri(uri, UriKind.Relative), TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiPaginationResponse>(TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result!.Items.Should().Contain(e => e.Id == eventInside.Id);
    }

    private static EventEntity CreateEventEntity(Guid id, string city, string name, double lat, double lng)
    {
        var entity = CreateEventEntity(id, city, name);

        // Re-create the Location/Address with custom coordinates since they are init-only
        var newAddress = new Address
        {
            Type = "PostalAddress",
            Name = "Test Address",
            Street = "Test Street 1",
            City = city,
            Country = "PL",
            PostalCode = "00-001",
            Latitude = lat,
            Longitude = lng
        };

        entity.Location = new Location
        {
            Type = "Place",
            Name = "Test Venue",
            Address = newAddress
        };

        return entity;
    }
    /// Posts an event to the single-create endpoint and returns the server-created EventEntity
    /// (with server-generated Id and CreatedAt).
    /// </summary>
    private async Task<EventEntity> PostEventAsync(EventEntity source)
    {
        using var jsonContent = JsonContent.Create(source);
        var postResponse = await _client.PostAsync(new Uri($"{ApiV1}/events", UriKind.Relative), jsonContent, TestContext.Current.CancellationToken);
        postResponse.StatusCode.Should().Be(HttpStatusCode.OK, $"Failed to create event: {source.Name}");
        var created = await postResponse.Content.ReadFromJsonAsync<EventEntity>(TestContext.Current.CancellationToken);
        created.Should().NotBeNull();
        return created!;
    }

    private static EventEntity CreateEventEntity(Guid id, string city, string name)
    {
        var address = new Address
        {
            Type = "PostalAddress",
            Name = "Test Address",
            Street = "Test Street 1",
            City = city,
            Country = "PL",
            PostalCode = "00-001",
            Latitude = 52.2297,
            Longitude = 21.0122
        };

        return new EventEntity
        {
            Id = id,
            Category = "MusicEvent",
            Name = name,
            Description = "A test concert description",
            StartDate = DateTime.UtcNow.AddDays(1),
            DatePublished = DateTime.UtcNow,
            Url = "https://example.com/events/1",
            EventStatus = "EventScheduled",
            AttendanceMode = "OfflineEventAttendanceMode",
            Provider = "TestProvider",
            CreatedAt = DateTime.UtcNow,
            Location = new Location
            {
                Type = "Place",
                Name = "Test Venue",
                Address = address
            },
            Performer = new Organization
            {
                Type = "MusicGroup",
                Name = "Test Band",
                Url = "https://example.com/testband",
                Address = address
            },
            Offer = new Offer
            {
                Type = "Offer",
                Price = 100,
                Currency = "PLN",
                Url = "https://example.com/tickets/1",
                IsAvailable = true
            }
        };
    }
}
