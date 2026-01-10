namespace Bibently.Application.Extensions;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddOptionsAndValidate<T>(
        this IServiceCollection services,
        IConfigurationSection configurationSection)
        where T : class
    {
        services.AddOptions<T>().Bind<T>((IConfiguration) configurationSection).ValidateDataAnnotations<T>().ValidateOnStart<T>();
        services.AddSingleton<T>((Func<IServiceProvider, T>) (sp => sp.GetRequiredService<IOptions<T>>().Value));
        return services;
    }
}