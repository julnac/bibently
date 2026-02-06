namespace Bibently.Application.Api.Tests.Middleware;

using Bibently.Application.Api.Middleware;
using Bibently.Application.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class TrackingAuthorizationTests
{
    private readonly Mock<RequestDelegate> _nextMock;
    private readonly Mock<ILogger<AuthorizationMiddleware>> _loggerMock;
    private readonly Mock<IFirebaseAuthService> _authServiceMock;
    private readonly AuthorizationMiddleware _middleware;

    public TrackingAuthorizationTests()
    {
        _nextMock = new Mock<RequestDelegate>();
        _loggerMock = new Mock<ILogger<AuthorizationMiddleware>>();
        _authServiceMock = new Mock<IFirebaseAuthService>();
        _middleware = new AuthorizationMiddleware(
            _nextMock.Object,
            _loggerMock.Object,
            _authServiceMock.Object);
    }

    [Fact]
    public async Task GivenPostTrackingAndGuest_WhenInvoking_ThenCallsNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Method = "POST";
        context.Request.Path = "/api/v1/tracking";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status200OK); // default, or simply not 401/403
        context.Response.Headers["X-Access-Type"].ToString().Should().Be("Public-Tracking");
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenPostTrackingAndUser_WhenInvoking_ThenCallsNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Method = "POST";
        context.Request.Path = "/api/v1/tracking";
        context.Request.Headers.Authorization = "Bearer user-token";

        var userInfo = new FirebaseUserInfo("user-123", "user@example.com", new Dictionary<string, object>());
        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("user-token"))
            .ReturnsAsync(userInfo);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        // context.Response.Headers["X-Access-Type"].ToString().Should().Be("Public-Tracking");
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenGetTrackingAndGuest_WhenInvoking_ThenReturns403()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = "/api/v1/tracking/123";
        context.Response.Body = new MemoryStream();

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        // Logic: GET /tracking is sensitive -> Requires Admin. Guest is not admin. -> 403.
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }

    [Fact]
    public async Task GivenGetTrackingAndNonAdminUser_WhenInvoking_ThenReturns403()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = "/api/v1/tracking/123";
        context.Request.Headers.Authorization = "Bearer user-token";
        context.Response.Body = new MemoryStream();

        var userInfo = new FirebaseUserInfo("user-123", "user@example.com", new Dictionary<string, object>());
        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("user-token"))
            .ReturnsAsync(userInfo);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }

    [Fact]
    public async Task GivenGetTrackingAndAdmin_WhenInvoking_ThenCallsNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = "/api/v1/tracking/123";
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
