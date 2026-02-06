namespace Bibently.Application.Api.Tests.Middleware;

using Bibently.Application.Api.Middleware;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

public class SecurityHeadersMiddlewareTests
{
    private readonly Mock<RequestDelegate> _nextMock;
    private readonly Mock<IWebHostEnvironment> _envMock;
    private readonly SecurityHeadersMiddleware _middleware;

    public SecurityHeadersMiddlewareTests()
    {
        _nextMock = new Mock<RequestDelegate>();
        _envMock = new Mock<IWebHostEnvironment>();
        // Default to development
        _envMock.Setup(e => e.EnvironmentName).Returns("Development");

        _middleware = new SecurityHeadersMiddleware(_nextMock.Object, _envMock.Object);
    }

    [Fact]
    public async Task GivenRequest_WhenInvoking_ThenAddsDefautSecurityHeaders()
    {
        // Arrange
        var context = new DefaultHttpContext();

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        var headers = context.Response.Headers;
        headers["X-Content-Type-Options"].ToString().Should().Be("nosniff");
        headers["X-Frame-Options"].ToString().Should().Be("DENY");
        headers["X-XSS-Protection"].ToString().Should().Be("1; mode=block");
        headers["Content-Security-Policy"].ToString().Should().Be("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'");
        headers["Referrer-Policy"].ToString().Should().Be("strict-origin-when-cross-origin");

        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenDevelopmentEnv_WhenInvoking_ThenDoesNotAddHsts()
    {
        // Arrange
        _envMock.Setup(e => e.EnvironmentName).Returns("Development");
        // Re-create middleware to pick up env change
        var middleware = new SecurityHeadersMiddleware(_nextMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.Headers.ContainsKey("Strict-Transport-Security").Should().BeFalse();
    }

    [Fact]
    public async Task GivenProductionEnv_WhenInvoking_ThenAddsHsts()
    {
        // Arrange
        _envMock.Setup(e => e.EnvironmentName).Returns("Production");
        var middleware = new SecurityHeadersMiddleware(_nextMock.Object, _envMock.Object);
        var context = new DefaultHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.Headers["Strict-Transport-Security"].ToString().Should().Be("max-age=31536000; includeSubDomains");
    }
}
