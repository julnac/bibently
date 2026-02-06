namespace Bibently.Application.Api.Tests.Middleware;

using Bibently.Application.Api.Middleware;
using Bibently.Application.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

/// <summary>
/// Tests for the AuthorizationMiddleware ensuring it correctly handles versioned API paths (/api/v1/...).
/// </summary>
public class VersionedPathAuthorizationTests
{
    private readonly Mock<RequestDelegate> _nextMock;
    private readonly Mock<ILogger<AuthorizationMiddleware>> _loggerMock;
    private readonly Mock<IFirebaseAuthService> _authServiceMock;
    private readonly AuthorizationMiddleware _middleware;

    public VersionedPathAuthorizationTests()
    {
        _nextMock = new Mock<RequestDelegate>();
        _loggerMock = new Mock<ILogger<AuthorizationMiddleware>>();
        _authServiceMock = new Mock<IFirebaseAuthService>();
        _middleware = new AuthorizationMiddleware(
            _nextMock.Object,
            _loggerMock.Object,
            _authServiceMock.Object);
    }

    [Theory]
    [InlineData("/api/v1/events")]
    [InlineData("/api/v1/events/123")]
    public async Task GivenVersionedGetEvents_WhenGuest_ThenReturns200WithPublicPreviewHeader(string path)
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "GET";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.Headers["X-Access-Type"].ToString().Should().Be("Public-Preview");
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Theory]
    [InlineData("/api/v1/events")]
    [InlineData("/api/v1/events/bulk")]
    public async Task GivenVersionedPostEvents_WhenGuest_ThenReturns403(string path)
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "POST";
        context.Response.Body = new MemoryStream();

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }

    [Theory]
    [InlineData("/api/v1/events")]
    [InlineData("/api/v1/events/bulk")]
    public async Task GivenVersionedPostEvents_WhenAdmin_ThenCallsNext(string path)
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "POST";
        context.Request.Headers.Authorization = "Bearer admin-token";

        var userInfo = new FirebaseUserInfo("admin-uid", "admin@example.com", new Dictionary<string, object>
        {
            { "role", "admin" }
        });
        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("admin-token"))
            .ReturnsAsync(userInfo);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenVersionedPostTracking_WhenGuest_ThenCallsNextWithPublicTrackingHeader()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/tracking";
        context.Request.Method = "POST";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.Headers["X-Access-Type"].ToString().Should().Be("Public-Tracking");
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Theory]
    [InlineData("/api/v1/tracking")]
    [InlineData("/api/v1/tracking/123")]
    public async Task GivenVersionedGetTracking_WhenGuest_ThenReturns403(string path)
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "GET";
        context.Response.Body = new MemoryStream();

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }

    [Theory]
    [InlineData("/api/v1/tracking")]
    [InlineData("/api/v1/tracking/123")]
    public async Task GivenVersionedGetTracking_WhenAdmin_ThenCallsNext(string path)
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = path;
        context.Request.Method = "GET";
        context.Request.Headers.Authorization = "Bearer admin-token";

        var userInfo = new FirebaseUserInfo("admin-uid", "admin@example.com", new Dictionary<string, object>
        {
            { "role", "admin" }
        });
        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("admin-token"))
            .ReturnsAsync(userInfo);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _nextMock.Verify(next => next(context), Times.Once);
    }
}
