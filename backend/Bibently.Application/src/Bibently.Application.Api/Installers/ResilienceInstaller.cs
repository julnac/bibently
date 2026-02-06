// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="ResilienceInstaller.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Installers;

using Microsoft.Extensions.DependencyInjection;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;

/// <summary>
/// Installer for Polly resilience pipelines.
/// </summary>
public static class ResilienceInstaller
{
    /// <summary>
    /// Adds resilience pipelines to the service collection.
    /// </summary>
    public static IServiceCollection AddAppResilience(this IServiceCollection services)
    {
        services.AddResiliencePipeline("firestore", builder =>
        {
            builder
                .AddRetry(new RetryStrategyOptions
                {
                    MaxRetryAttempts = 3,
                    Delay = TimeSpan.FromMilliseconds(500),
                    BackoffType = DelayBackoffType.Exponential
                })
                .AddCircuitBreaker(new CircuitBreakerStrategyOptions
                {
                    FailureRatio = 0.5,
                    SamplingDuration = TimeSpan.FromSeconds(30),
                    BreakDuration = TimeSpan.FromSeconds(30)
                })
                .AddTimeout(TimeSpan.FromSeconds(10));
        });

        return services;
    }
}

