// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="ApiVersioningInstaller.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Installers;

using Asp.Versioning;

/// <summary>
/// Installer for API versioning configuration.
/// </summary>
public static class ApiVersioningInstaller
{
    /// <summary>
    /// Adds API versioning services to the service collection.
    /// </summary>
    public static IServiceCollection AddAppApiVersioning(this IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            // Default to v1 when no version is specified
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;

            // Report API versions in response headers
            options.ReportApiVersions = true;

            // Read version from URL segment (e.g., /api/v1/events)
            options.ApiVersionReader = new UrlSegmentApiVersionReader();
        });

        return services;
    }
}
