// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="ValidationInstaller.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Installers;

using Bibently.Application.Api.Validation;
using FluentValidation;

/// <summary>
/// Installer for FluentValidation configuration.
/// </summary>
public static class ValidationInstaller
{
    /// <summary>
    /// Adds validation services to the service collection.
    /// </summary>
    public static IServiceCollection AddAppValidation(this IServiceCollection services)
    {
        // Register all validators from the API assembly
        services.AddValidatorsFromAssemblyContaining<EventEntityValidator>(ServiceLifetime.Singleton);

        return services;
    }
}
