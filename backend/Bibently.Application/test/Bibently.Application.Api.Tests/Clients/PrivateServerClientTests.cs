namespace Bibently.Application.Api.Tests.Clients;

using System.Net;
using System.Text.Json;
using Bibently.Application.Abstractions.Models;
using Bibently.Application.Api.Clients;
using Bibently.Application.Api.Settings;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Xunit;

public class PrivateServerClientTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    [Fact]
    public async Task GivenValidRequest_WhenCreateEvent_ThenReturnsEventEntity()
    {
        // Arrange
        var expectedEvent = CreateSampleEventEntity();
        var json = JsonSerializer.Serialize(expectedEvent, JsonOptions);

        using var handler = new MockHttpMessageHandler(HttpStatusCode.OK, json);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://ps.test.com") };

        var client = CreateClient(httpClient);

        var request = CreateSampleRequest();

        // Act
        var result = await client.CreateEventAsync(request, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(expectedEvent.Id);
        result.Name.Should().Be(expectedEvent.Name);
        result.Category.Should().Be(expectedEvent.Category);
        result.CreatedAt.Should().BeCloseTo(expectedEvent.CreatedAt, TimeSpan.FromSeconds(1));

        handler.LastRequest.Should().NotBeNull();
        handler.LastRequest!.Method.Should().Be(HttpMethod.Post);
        handler.LastRequest.RequestUri!.PathAndQuery.Should().Be("/events");

        // Verify Auth Header
        handler.LastRequest.Headers.Authorization.Should().NotBeNull();
        handler.LastRequest.Headers.Authorization!.Scheme.Should().Be("Bearer");
        handler.LastRequest.Headers.Authorization!.Parameter.Should().Be("test-token");
    }

    [Fact]
    public async Task GivenUnauthorizedResponse_WhenCreateEvent_ThenThrowsUnauthorizedAccessException()
    {
        // Arrange
        using var handler = new MockHttpMessageHandler(HttpStatusCode.Unauthorized, "{}");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://ps.test.com") };
        var client = CreateClient(httpClient);

        var request = CreateSampleRequest();

        // Act
        var act = () => client.CreateEventAsync(request, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Private Server authentication failed.");
    }

    [Fact]
    public async Task GivenServerReturnsError_WhenCreateEvent_ThenThrowsHttpRequestException()
    {
        // Arrange
        using var handler = new MockHttpMessageHandler(HttpStatusCode.InternalServerError, "{}");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://ps.test.com") };
        var client = CreateClient(httpClient);

        var request = CreateSampleRequest();

        // Act
        var act = () => client.CreateEventAsync(request, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<HttpRequestException>();
    }

    [Fact]
    public async Task GivenServerReturnsBadRequest_WhenCreateEvent_ThenThrowsHttpRequestException()
    {
        // Arrange
        using var handler = new MockHttpMessageHandler(HttpStatusCode.BadRequest, "{\"error\":\"invalid\"}");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://ps.test.com") };
        var client = CreateClient(httpClient);

        var request = CreateSampleRequest();

        // Act
        var act = () => client.CreateEventAsync(request, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<HttpRequestException>();
    }

    [Fact]
    public async Task GivenServerReturnsEmptyBody_WhenCreateEvent_ThenThrowsInvalidOperationException()
    {
        // Arrange
        using var handler = new MockHttpMessageHandler(HttpStatusCode.OK, "null");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://ps.test.com") };
        var client = CreateClient(httpClient);

        var request = CreateSampleRequest();

        // Act
        var act = () => client.CreateEventAsync(request, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*response body was empty*");
    }

    [Fact]
    public async Task GivenCancellationRequested_WhenCreateEvent_ThenThrowsTaskCanceledException()
    {
        // Arrange
        using var cts = new CancellationTokenSource();
        await cts.CancelAsync();

        using var handler = new MockHttpMessageHandler(HttpStatusCode.OK, "{}");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://ps.test.com") };
        var client = CreateClient(httpClient);

        var request = CreateSampleRequest();

        // Act
        var act = () => client.CreateEventAsync(request, cts.Token);

        // Assert
        await act.Should().ThrowAsync<TaskCanceledException>();
    }

    private static PrivateServerClient CreateClient(HttpClient httpClient)
    {
        var settings = new PrivateServerSettings { BaseUrl = "https://ps.test.com", BearerToken = "test-token" };
        var options = Options.Create(settings);
        return new PrivateServerClient(httpClient, options);
    }

    private static CreateEventEntityRequest CreateSampleRequest() => new()
    {
        Category = "MusicEvent",
        Name = "Test Concert",
        Description = "A test concert",
        StartDate = DateTime.UtcNow.AddDays(1),
        DatePublished = DateTime.UtcNow,
        Url = "https://example.com/events/1",
        EventStatus = "EventScheduled",
        AttendanceMode = "OfflineEventAttendanceMode",
        Provider = "TestProvider",
        Location = new Location
        {
            Type = "Place",
            Name = "Test Venue",
            Address = new Address { Type = "PostalAddress", Name = "Addr", City = "Warsaw", Country = "PL" }
        },
        Performer = new Organization
        {
            Type = "MusicGroup",
            Name = "Test Band",
            Url = "https://example.com/testband",
            Address = new Address { Type = "PostalAddress", Name = "Addr", City = "Warsaw", Country = "PL" }
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

    private static EventEntity CreateSampleEventEntity() => new()
    {
        Id = Guid.NewGuid(),
        Category = "MusicEvent",
        Name = "Test Concert",
        Description = "A test concert",
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
            Address = new Address { Type = "PostalAddress", Name = "Addr", City = "Warsaw", Country = "PL" }
        },
        Performer = new Organization
        {
            Type = "MusicGroup",
            Name = "Test Band",
            Url = "https://example.com/testband",
            Address = new Address { Type = "PostalAddress", Name = "Addr", City = "Warsaw", Country = "PL" }
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

    /// <summary>
    /// Simple HttpMessageHandler stub that returns a predefined response.
    /// </summary>
    private sealed class MockHttpMessageHandler(HttpStatusCode statusCode, string content) : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            LastRequest = request;

            var response = new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(content, System.Text.Encoding.UTF8, "application/json")
            };

            return Task.FromResult(response);
        }
    }
}
