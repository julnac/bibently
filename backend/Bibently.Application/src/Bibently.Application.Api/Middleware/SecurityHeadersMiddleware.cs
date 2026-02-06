namespace Bibently.Application.Api.Middleware;

/// <summary>
/// Adds standard HTTP security headers to responses to harden the application against common web attacks.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly bool _isProduction;

    public SecurityHeadersMiddleware(RequestDelegate next, IHostEnvironment environment)
    {
        _next = next;
        _isProduction = environment.IsProduction();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // 1. Prevent MIME-Sniffing
        // Tells the browser to trust the "Content-Type" header explicitly.
        // Prevents attackers from disguising malicious files (e.g., HTML as images).
        headers["X-Content-Type-Options"] = "nosniff";

        // 2. Prevent Clickjacking
        // Stops your site from being embedded in an iframe on another site.
        headers["X-Frame-Options"] = "DENY";

        // 3. XSS Protection
        // Enables the browser's built-in Cross-Site Scripting filter (mostly for older browsers).
        headers["X-XSS-Protection"] = "1; mode=block";

        // 4. Force HTTPS (HSTS) - Production Only
        // Tells the browser to ONLY connect via HTTPS for the next year.
        if (_isProduction)
        {
            headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
        }

        // 5. Content Security Policy (CSP)
        // Relaxed policy to allow Scalar UI / Swagger UI to function (needs scripts/styles/images)
        headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'";

        // 6. Referrer Policy
        // Controls how much referrer information (the URL the user came from) is sent.
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        await _next(context);
    }
}

/// <summary>
/// Extension methods for configuring security headers middleware.
/// </summary>
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
