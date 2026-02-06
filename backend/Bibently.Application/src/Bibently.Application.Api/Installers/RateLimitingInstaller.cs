namespace Bibently.Application.Api.Installers;

using System.Threading.RateLimiting;

/// <summary>
/// Configuration options for rate limiting policies.
/// </summary>
public sealed class RateLimitingOptions
{
    public RateLimitPolicyOptions Global { get; set; } = new();
    public RateLimitPolicyOptions Strict { get; set; } = new();
}

/// <summary>
/// Configuration for a single rate limit policy.
/// </summary>
public sealed class RateLimitPolicyOptions
{
    public int PermitLimit { get; set; } = 50;
    public int WindowMinutes { get; set; } = 1;
}

public static class RateLimitingInstaller
{
    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var rateLimitingOptions = configuration.GetSection("RateLimiting").Get<RateLimitingOptions>() ?? new RateLimitingOptions();

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                // Partition by IP address
                // Use "unknown" if IP is missing (though unusual in HTTP)
                var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: partitionKey,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = rateLimitingOptions.Global.PermitLimit,
                        Window = TimeSpan.FromMinutes(rateLimitingOptions.Global.WindowMinutes),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 5
                    });
            });

            // Strict policy for sensitive endpoints (e.g., login, password reset)
            options.AddPolicy("Strict", context =>
            {
                var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = rateLimitingOptions.Strict.PermitLimit,
                    Window = TimeSpan.FromMinutes(rateLimitingOptions.Strict.WindowMinutes),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0
                });
            });
        });

        return services;
    }
}
