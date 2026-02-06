namespace Bibently.Application.Integration.Tests;

using System.Net;
using FluentAssertions;
using Xunit;

public class CorsTests : IClassFixture<BibentlyWebApplicationFactory>
{
    private readonly BibentlyWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public CorsTests(BibentlyWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GivenRequest_WhenCorsHeadersChecked_ThenReturnsAllowedOrigins()
    {
        // Act
        // Use an OPTIONS request to trigger CORS preflight check
        using var request = new HttpRequestMessage(HttpMethod.Options, "/events");
        request.Headers.Add("Origin", "http://localhost:3000");
        request.Headers.Add("Access-Control-Request-Method", "GET");
        request.Headers.Add("Access-Control-Request-Headers", "content-type");

        var response = await _client.SendAsync(request, TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent); // Standard CORS success status

        response.Headers.Contains("Access-Control-Allow-Origin").Should().BeTrue();
        response.Headers.GetValues("Access-Control-Allow-Origin").First().Should().Be("http://localhost:3000");

        response.Headers.Contains("Access-Control-Allow-Methods").Should().BeTrue();
        response.Headers.Contains("Access-Control-Allow-Headers").Should().BeTrue();
    }

    [Fact]
    public async Task GivenDisallowedOrigin_WhenCorsHeadersChecked_ThenDoesNotReturnAllowOrigin()
    {
        // Act
        using var request = new HttpRequestMessage(HttpMethod.Options, "/events");
        request.Headers.Add("Origin", "http://evil.com");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        var response = await _client.SendAsync(request, TestContext.Current.CancellationToken);

        // Assert
        // Standard behavior for disallowed origin is NOT to send the Access-Control-Allow-Origin header
        response.Headers.Contains("Access-Control-Allow-Origin").Should().BeFalse();
    }
}
