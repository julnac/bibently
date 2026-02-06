namespace Bibently.Application.Api.Tests.Middleware;

using Bibently.Application.Api.Middleware;
using Bibently.Application.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class AuthorizationMiddlewareTests
{
    private readonly Mock<RequestDelegate> _nextMock;
    private readonly Mock<ILogger<AuthorizationMiddleware>> _loggerMock;
    private readonly Mock<IFirebaseAuthService> _authServiceMock;
    private readonly AuthorizationMiddleware _middleware;

    public AuthorizationMiddlewareTests()
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
    public async Task GivenExcludedPath_WhenInvoking_ThenCallsNextAndReturns()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/health";

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenProtectedPathAndNoToken_WhenInvoking_ThenReturns401()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/some-protected-path";
        context.Request.Method = "GET";
        context.Response.Body = new MemoryStream();

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }

    [Fact]
    public async Task GivenValidToken_WhenInvoking_ThenInjectsUserAndCallsNext()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/some-protected-path";
        context.Request.Method = "GET";
        context.Request.Headers.Authorization = "Bearer valid-token";

        var userInfo = new FirebaseUserInfo("user-123", "user@example.com", new Dictionary<string, object>());
        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("valid-token"))
            .ReturnsAsync(userInfo);

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        var user = context.Items[typeof(AuthenticatedUser)] as AuthenticatedUser;
        user.Should().NotBeNull();
        user!.Uid.Should().Be("user-123");
        _nextMock.Verify(next => next(context), Times.Once);
    }

    [Fact]
    public async Task GivenInvalidToken_WhenInvoking_ThenReturns401()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/some-protected-path";
        context.Request.Method = "GET";
        context.Request.Headers.Authorization = "Bearer invalid-token";
        context.Response.Body = new MemoryStream();

        _authServiceMock.Setup(s => s.VerifyIdTokenAsync("invalid-token"))
            .ThrowsAsync(new Exception("Invalid token"));

        // Act
        await _middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        _nextMock.Verify(next => next(It.IsAny<HttpContext>()), Times.Never);
    }
}
