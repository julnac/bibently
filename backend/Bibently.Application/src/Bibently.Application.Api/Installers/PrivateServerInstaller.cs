// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="PrivateServerInstaller.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Installers;

using Bibently.Application.Api.Clients;
using Bibently.Application.Api.Settings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;

/// <summary>
/// Installer for the Private Server (PS) HTTP client and its resilience pipeline.
/// </summary>
public static class PrivateServerInstaller
{
    /// <summary>
    /// Registers the Private Server typed HTTP client with authentication and standard resilience.
    /// </summary>
    public static IServiceCollection AddPrivateServerClient(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<PrivateServerSettings>(configuration.GetSection("PrivateServer"));

        services.AddHttpClient<IPrivateServerClient, PrivateServerClient>((serviceProvider, client) =>
        {
            var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<PrivateServerSettings>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl);
        }).AddStandardResilienceHandler(options =>
        {
            options.Retry.MaxRetryAttempts = 2;
            options.Retry.Delay = TimeSpan.FromMilliseconds(500);
            options.Retry.BackoffType = DelayBackoffType.Exponential;
            options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(10);
            options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}
