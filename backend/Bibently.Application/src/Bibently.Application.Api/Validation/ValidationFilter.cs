// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="ValidationFilter.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

namespace Bibently.Application.Api.Validation;

using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

/// <summary>
/// Endpoint filter that performs FluentValidation on request parameters.
/// </summary>
/// <typeparam name="T">The type to validate.</typeparam>
public class ValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var validator = context.HttpContext.RequestServices.GetService<IValidator<T>>();

        if (validator is null)
        {
            return await next(context);
        }

        // Find the argument of type T
        var argToValidate = context.Arguments.OfType<T>().FirstOrDefault();

        if (argToValidate is null)
        {
            return await next(context);
        }

        var validationResult = await validator.ValidateAsync(argToValidate);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            return Results.ValidationProblem(errors, title: "Validation failed");
        }

        return await next(context);
    }
}

/// <summary>
/// Extension methods for applying validation filters to endpoints.
/// </summary>
public static class ValidationFilterExtensions
{
    /// <summary>
    /// Adds a validation filter for the specified type to the endpoint.
    /// </summary>
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) where T : class
    {
        return builder.AddEndpointFilter<ValidationFilter<T>>();
    }

    /// <summary>
    /// Adds validation filters for multiple types to the endpoint.
    /// </summary>
    public static RouteHandlerBuilder WithValidation<T1, T2>(this RouteHandlerBuilder builder)
        where T1 : class
        where T2 : class
    {
        return builder
            .AddEndpointFilter<ValidationFilter<T1>>()
            .AddEndpointFilter<ValidationFilter<T2>>();
    }
}
