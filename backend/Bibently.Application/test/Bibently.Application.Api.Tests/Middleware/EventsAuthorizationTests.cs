namespace Bibently.Application.Api.Tests.Middleware;

using Bibently.Application.Api.Middleware;
using Bibently.Application.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class EventsAuthorizationTests
{
    private readonly Mock<RequestDelegate> _nextMock;
    private readonly Mock<ILogger<AuthorizationMiddleware>> _loggerMock;
    private readonly Mock<IFirebaseAuthService> _authServiceMock;
    private readonly AuthorizationMiddleware _middleware;

    public EventsAuthorizationTests()
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
    public async Task GivenGetEventsAndGuest_WhenInvoking_ThenReturns200WithPublicPreviewHeader()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/events";
        context.Request.Method = "GET";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.Headers["X-Access-Type"].ToString().Should().Be("Public-Preview");
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenGetEventsAndUser_WhenInvoking_ThenCallsNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/events";
        context.Request.Method = "GET";
        context.Request.Headers.Authorization = "Bearer user-token";

        var userInfo = new FirebaseUserInfo("user-123", "user@example.com", new Dictionary<string, object>());
        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("user-token"))
            .ReturnsAsync(userInfo);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _nextMock.Verify(next => next(context), Times.Once);
        context.Response.Headers.ContainsKey("X-Access-Type").Should().BeFalse();
    }

    [Fact]
    public async Task GivenPostEventAndGuest_WhenInvoking_ThenReturns403()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/events";
        context.Request.Method = "POST";
        context.Response.Body = new MemoryStream();

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }

    [Fact]
    public async Task GivenPostEventAndNonAdminUser_WhenInvoking_ThenReturns403()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/events";
        context.Request.Method = "POST";
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
    public async Task GivenPostEventAndAdmin_WhenInvoking_ThenCallsNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/events";
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
}
