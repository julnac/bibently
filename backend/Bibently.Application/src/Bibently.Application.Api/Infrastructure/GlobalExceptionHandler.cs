namespace Bibently.Application.Api.Infrastructure;

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(
            exception,
            "An unhandled exception occurred processing {Method} {Path}",
            httpContext.Request.Method,
            httpContext.Request.Path);

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An error occurred while processing your request.",
            Detail = "Please contact support if the issue persists."
        };

        // In development, you might want to expose more details
        // if (environment.IsDevelopment()) ... but typically we rely on logs.

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        // WriteAsJsonAsync using the generated context for AOT safety
        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            AppJsonContext.Default.ProblemDetails,
            cancellationToken: cancellationToken);

        return true;
    }
}
