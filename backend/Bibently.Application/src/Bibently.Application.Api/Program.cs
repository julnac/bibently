using System.Globalization;
using Bibently.Application.Api;
using Bibently.Application.Api.Endpoints;
using Bibently.Application.Api.Infrastructure;
using Bibently.Application.Api.Installers;
using Bibently.Application.Api.Mappings;
using Bibently.Application.Api.Middleware;
using Bibently.Application.Api.Services;
using Bibently.Application.Repository;
using Serilog;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console(formatProvider: CultureInfo.InvariantCulture));

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default);
});

builder.Services
    .AddFirebase(builder.Environment.IsDevelopment())
    .AddSingleton<IEventsRepository, FirestoreEventsRepository>()
    .AddSingleton<ITrackingRepository, FirestoreTrackingRepository>()
    .AddSingleton<IUsersRepository, FirestoreUsersRepository>();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApiDocumentation();
}
builder.Services.AddSingleton<AppMapper>();

builder.Services.AddPrivateServerClient(builder.Configuration);

builder.Services.AddScoped<IEventsService, EventsService>();
builder.Services.AddScoped<ITrackingService, TrackingService>();
builder.Services.AddScoped<IUsersService, UsersService>();

builder.Services.AddAppAuth();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHealthChecks();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.Configure<RouteOptions>(options =>
{
    options.SetParameterPolicy<Microsoft.AspNetCore.Routing.Constraints.RegexInlineRouteConstraint>("regex");
});

builder.Services.AddAppCors(builder.Configuration);
builder.Services.AddAppRateLimiting(builder.Configuration);
builder.Services.AddAppValidation();
builder.Services.AddAppApiVersioning();
builder.Services.AddAppResilience();
builder.Services.AddResponseCompression(options => options.EnableForHttps = true);

// === Output Caching (in-memory, lightweight for fast cold starts) ===
builder.Services.AddOutputCache(options =>
{
    // Define cache policy for events endpoint
    options.AddPolicy("EventsCache", policy => policy
        .Expire(TimeSpan.FromMinutes(2))
        .SetVaryByQuery("city", "name", "startDate", "endDate", "minPrice", "maxPrice", "type", "keywords", "pageSize", "pageToken", "sortKey", "order")
        .Tag("events"));

    // Default size limit to prevent memory issues in container
    options.SizeLimit = 50 * 1024 * 1024; // 50 MB max cache size
});

var app = builder.Build();

app.UseExceptionHandler();

// === Correlation ID Middleware ===
// Adds correlation ID to response headers and enriches log context for distributed tracing
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Correlation-ID"] = context.TraceIdentifier;
    using (Serilog.Context.LogContext.PushProperty("CorrelationId", context.TraceIdentifier))
    {
        await next();
    }
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApiUi();
}
app.MapHealthChecks("/health/live").AllowAnonymous();
app.MapHealthChecks("/health/ready").AllowAnonymous();

app.UseSerilogRequestLogging(opts =>
{
    opts.EnrichDiagnosticContext = (diagnostic, httpContext) =>
        diagnostic.Set("CorrelationId", httpContext.TraceIdentifier);
});

app.UseAppCors();
app.UseRateLimiter();
app.UseSecurityHeaders();
app.UseAuthentication();
app.UseAuthorization();
app.UseResponseCompression();
app.UseOutputCache();

// === Versioned API Endpoints ===
// All endpoints are now under /api/v1 for proper API versioning
var apiV1 = app.MapGroup("/api/v1");

EventsEndpoints.Map(apiV1);
TrackingEndpoints.Map(apiV1);
MeEndpoints.Map(apiV1);
ConfigurationEndpoints.Map(apiV1);

// === Utility Endpoints (non-versioned) ===
UtilityEndpoints.Map(app);

await app.RunAsync();
