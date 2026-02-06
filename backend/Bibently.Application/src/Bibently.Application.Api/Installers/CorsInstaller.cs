namespace Bibently.Application.Api.Installers;

/// <summary>
/// Installer for CORS configuration.
/// </summary>
public static class CorsInstaller
{
    private const string CorsPolicyName = "CorsPolicy";

    /// <summary>
    /// Adds CORS services to the service collection.
    /// </summary>
    public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?.ToList() ?? [];

            // Support environment variable for easier production config (semicolon separated)
            var envOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
            if (!string.IsNullOrEmpty(envOrigins))
            {
                allowedOrigins.AddRange(envOrigins.Split(';', StringSplitOptions.RemoveEmptyEntries));
            }

            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy.WithOrigins([.. allowedOrigins])
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }

    /// <summary>
    /// Uses the configured CORS policy.
    /// </summary>
    public static IApplicationBuilder UseAppCors(this IApplicationBuilder app)
    {
        return app.UseCors(CorsPolicyName);
    }
}
