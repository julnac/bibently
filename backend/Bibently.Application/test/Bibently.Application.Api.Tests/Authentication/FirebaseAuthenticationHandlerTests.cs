namespace Bibently.Application.Api.Tests.Authentication;

using System.Text.Encodings.Web;
using Bibently.Application.Abstractions.Enums;
using Bibently.Application.Api.Authentication;
using Bibently.Application.Api.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

public class FirebaseAuthenticationHandlerTests
{
    private readonly Mock<IFirebaseAuthService> _authServiceMock = new();

    [Fact]
    public async Task GivenNoAuthorizationHeader_WhenAuthenticate_ThenReturnsNoResult()
    {
        // Arrange
        var handler = await CreateHandler(new DefaultHttpContext());

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.None.Should().BeTrue("No Authorization header should yield NoResult");
    }

    [Fact]
    public async Task GivenEmptyBearerToken_WhenAuthenticate_ThenReturnsNoResult()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer ";
        var handler = await CreateHandler(context);

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.None.Should().BeTrue("Empty bearer token should yield NoResult");
    }

    [Fact]
    public async Task GivenNonBearerScheme_WhenAuthenticate_ThenReturnsNoResult()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Basic dXNlcjpwYXNz";
        var handler = await CreateHandler(context);

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.None.Should().BeTrue("Non-Bearer scheme should yield NoResult");
    }

    [Fact]
    public async Task GivenValidToken_WhenAuthenticate_ThenReturnsSuccessWithClaims()
    {
        // Arrange
        // The handler uses case-insensitive enum parsing, so "admin" works
        var claims = new Dictionary<string, object> { { "role", "admin" } };
        _authServiceMock
            .Setup(s => s.VerifyIdTokenAsync("valid-token"))
            .ReturnsAsync(new FirebaseUserInfo("uid-123", "user@example.com", claims));

        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer valid-token";
        var handler = await CreateHandler(context);

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Principal.Should().NotBeNull();

        var identity = result.Principal!.Identity;
        identity.Should().NotBeNull();
        identity!.IsAuthenticated.Should().BeTrue();

        result.Principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            .Should().Be("uid-123");
        result.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            .Should().Be("user@example.com");

        // The handler normalizes the role to the enum string value "Admin"
        result.Principal.IsInRole(Role.Admin.ToString()).Should().BeTrue();
    }

    [Fact]
    public async Task GivenValidTokenWithoutRole_WhenAuthenticate_ThenReturnsSuccessWithoutRoleClaim()
    {
        // Arrange
        var claims = new Dictionary<string, object>();
        _authServiceMock
            .Setup(s => s.VerifyIdTokenAsync("user-token"))
            .ReturnsAsync(new FirebaseUserInfo("uid-456", "regular@example.com", claims));

        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer user-token";
        var handler = await CreateHandler(context);

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Principal!.IsInRole(Role.Admin.ToString()).Should().BeFalse();
    }

    [Fact]
    public async Task GivenInvalidToken_WhenAuthenticate_ThenReturnsFail()
    {
        // Arrange
        _authServiceMock
            .Setup(s => s.VerifyIdTokenAsync("bad-token"))
            .ThrowsAsync(new Exception("Token expired"));

        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer bad-token";
        var handler = await CreateHandler(context);

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Failure!.Message.Should().Contain("Token expired");
    }

    [Fact]
    public async Task GivenValidTokenWithNullEmail_WhenAuthenticate_ThenSucceedsWithoutEmailClaim()
    {
        // Arrange
        var claims = new Dictionary<string, object>();
        _authServiceMock
            .Setup(s => s.VerifyIdTokenAsync("no-email-token"))
            .ReturnsAsync(new FirebaseUserInfo("uid-789", null, claims));

        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = "Bearer no-email-token";
        var handler = await CreateHandler(context);

        // Act
        var result = await handler.AuthenticateAsync();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Principal!.FindFirst(System.Security.Claims.ClaimTypes.Email)
            .Should().BeNull("No email claim should be added when email is null");
    }

    /// <summary>
    /// Creates and initializes a <see cref="FirebaseAuthenticationHandler"/> for testing.
    /// </summary>
    private async Task<FirebaseAuthenticationHandler> CreateHandler(HttpContext context)
    {
        var options = new AuthenticationSchemeOptions();
        var optionsMonitor = new Mock<IOptionsMonitor<AuthenticationSchemeOptions>>();
        optionsMonitor.Setup(o => o.Get(FirebaseAuthenticationHandler.SchemeName)).Returns(options);

        var loggerFactory = NullLoggerFactory.Instance;
        var encoder = UrlEncoder.Default;

        var handler = new FirebaseAuthenticationHandler(
            optionsMonitor.Object,
            loggerFactory,
            encoder,
            _authServiceMock.Object);

        var scheme = new AuthenticationScheme(
            FirebaseAuthenticationHandler.SchemeName,
            null,
            typeof(FirebaseAuthenticationHandler));

        await handler.InitializeAsync(scheme, context);

        return handler;
    }
}
