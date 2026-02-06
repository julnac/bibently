namespace Bibently.Application.Api.Middleware;

using Bibently.Application.Api.Services;
using Microsoft.Extensions.Logging;
using Bibently.Application.Api;

/// <summary>
/// Custom context key type to prevent collisions in the HttpContext.Items dictionary.
/// </summary>
public class UserContextKey;

/// <summary>
/// Represents an authenticated user from a Firebase ID token.
/// </summary>
public class AuthenticatedUser
{
    public required string Uid { get; init; }
    public required string Email { get; init; }
    public required Dictionary<string, object> Claims { get; init; }
}

/// <summary>
/// Authorization middleware that validates Firebase ID tokens and enforces role-based access control.
/// </summary>
public class AuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthorizationMiddleware> _logger;
    private readonly IFirebaseAuthService _authService;


    private static readonly HashSet<string> ExcludedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/index.html",
        "/index.js",
        "/index.css",
        "/favicon.ico",
        "/favicon-32x32.png",
        "/favicon-16x16.png",
        "/apple-touch-icon.png",
        "/openapi",
        "/scalar",
        "/health",
        "/.well-known",
        "/robots.txt"
    };

    private static readonly string[] ExcludedExtensions = { ".js", ".css", ".png", ".jpg", ".jpeg", ".ico", ".svg", ".json", ".yaml", ".map" };

    public AuthorizationMiddleware(
        RequestDelegate next,
        ILogger<AuthorizationMiddleware> logger,
        IFirebaseAuthService authService)
    {
        _next = next;
        _logger = logger;
        _authService = authService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 0. Check if path is excluded from authorization
        if (IsPathExcluded(context.Request.Path))
        {
            await _next(context);
            return;
        }

        var token = ExtractToken(context);
        AuthenticatedUser? authenticatedUser = null;

        // 1. Verify token if present
        if (!string.IsNullOrEmpty(token))
        {
            authenticatedUser = await VerifyToken(token);
        }

        var isAuthenticated = authenticatedUser != null;
        var isGetRequest = HttpMethods.IsGet(context.Request.Method);

        // 2. Enforce Admin Role for write operations OR sensitive GET operations (e.g. Tracking data)
        // Tracking POSTs are exempt from this rule (publicly accessible)
        // Support both legacy paths and versioned /api/v1/ paths
        var isTrackingPost = HttpMethods.IsPost(context.Request.Method) && IsTrackingPath(context.Request.Path);

        // GET /tracking is sensitive and requires Admin
        var isTrackingGet = isGetRequest && IsTrackingPath(context.Request.Path);

        if ((!isGetRequest && !isTrackingPost) || isTrackingGet)
        {
            if (!isAuthenticated || !IsUserAdmin(authenticatedUser))
            {
                _logger.LogWarning("Forbidden access attempt on {Method} {Path}", context.Request.Method, context.Request.Path);
                await WriteErrorResponse(context, StatusCodes.Status403Forbidden, "Forbidden: Admins only");
                return;
            }
        }

        // 3. User is fully authenticated
        if (isAuthenticated && authenticatedUser != null)
        {
            context.Items[typeof(AuthenticatedUser)] = authenticatedUser;
            context.Items[typeof(UserContextKey)] = authenticatedUser;
            await _next(context);
            return;
        }

        // 4. Guest Access Logic
        // Allow GET /events (both legacy and versioned paths)
        if (isGetRequest && IsEventsPath(context.Request.Path))
        {
            context.Response.Headers["X-Access-Type"] = "Public-Preview";
            await _next(context);
            return;
        }

        // Allow POST /tracking
        if (isTrackingPost)
        {
            context.Response.Headers["X-Access-Type"] = "Public-Tracking";
            await _next(context);
            return;
        }

        // 5. Deny Access
        _logger.LogWarning("Unauthorized access attempt on {Method} {Path}", context.Request.Method, context.Request.Path);
        await WriteErrorResponse(context, StatusCodes.Status401Unauthorized, "Unauthorized: Valid Bearer token required");
    }

    private static string? ExtractToken(HttpContext context)
    {
        var authHeader = context.Request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return authHeader[prefix.Length..].Trim();
    }

    private async Task<AuthenticatedUser?> VerifyToken(string token)
    {
        try
        {
            var decodedToken = await _authService.VerifyIdTokenAsync(token);
            return new AuthenticatedUser
            {
                Uid = decodedToken.Uid,
                Email = decodedToken.Email ?? string.Empty,
                Claims = new Dictionary<string, object>(decodedToken.Claims)
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Firebase token verification failed: {Message}", ex.Message);
            return null;
        }
    }

    private static bool IsPathExcluded(PathString path)
    {
        if (!path.HasValue) return false;

        var pathValue = path.Value!;

        // Check if root or exact match
        if (pathValue == "/" || ExcludedPaths.Contains(pathValue))
            return true;

        // Check segment prefixes (e.g., /openapi/v1.json matches /openapi)
        if (ExcludedPaths.Any(excluded => path.StartsWithSegments(excluded, StringComparison.InvariantCulture)))
        {
            return true;
        }

        // Fallback for static assets
        foreach (var ext in ExcludedExtensions)
        {
            if (pathValue.EndsWith(ext, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    /// <summary>
    /// Checks if the request path is for events (supports versioned and legacy paths).
    /// </summary>
    private static bool IsEventsPath(PathString path)
    {
        return path.StartsWithSegments("/api/v1/events", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks if the request path is for tracking (supports versioned and legacy paths).
    /// </summary>
    private static bool IsTrackingPath(PathString path)
    {
        return path.StartsWithSegments("/api/v1/tracking", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task WriteErrorResponse(HttpContext context, int statusCode, string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new ErrorResponse(message), AppJsonContext.Default.ErrorResponse);
    }

    private static bool IsUserAdmin(AuthenticatedUser? user)
    {
        if (user is null) return false;

        // Check for 'role' claim with value 'admin'
        if (user.Claims.TryGetValue("role", out var role) && role is string roleStr)
        {
            return string.Equals(roleStr, "admin", StringComparison.OrdinalIgnoreCase);
        }

        return false;
    }
}

/// <summary>
/// Extension methods for configuring authorization middleware.
/// </summary>
public static class AuthorizationMiddlewareExtensions
{
    public static IApplicationBuilder UseAuthorizationMiddleware(this IApplicationBuilder app)
    {
        return app.UseMiddleware<AuthorizationMiddleware>();
    }
}
