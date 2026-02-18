// ---------------------------------------------------------------------------------------------------------------------
// <copyright file="OpenApiInstaller.cs" company="bibently">
// © bibently. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------------------------------------------------

using System.Globalization;
using System.Text.Json.Nodes;
using Scalar.AspNetCore;

namespace Bibently.Application.Api.Installers;

using Microsoft.OpenApi;

public static class OpenApiInstaller
{
    /// <summary>
    /// List of supported API versions for OpenAPI documentation.
    /// Add new versions here as the API evolves.
    /// </summary>
    private static readonly string[] SupportedVersions = ["v1"];

    public static IServiceCollection AddOpenApiDocumentation(this IServiceCollection services)
    {
        // Register OpenAPI documents for each supported version
        foreach (var version in SupportedVersions)
        {
            services.AddOpenApi(version, options =>
            {
                ConfigureOpenApiOptions(options, version);
            });
        }

        return services;
    }

    private static void ConfigureOpenApiOptions(Microsoft.AspNetCore.OpenApi.OpenApiOptions options, string version)
    {
        options.AddSchemaTransformer((schema, context, cancellationToken) =>
        {
            var type = context.JsonTypeInfo.Type;
            var underlyingType = Nullable.GetUnderlyingType(type) ?? type;

            // Provide default examples ONLY for primitive types.
            // DO NOT set Example for Objects/Enums/Collections here, as it overrides the automatic property discovery.
            if (schema.Example == null)
            {
                if (underlyingType == typeof(string))
                {
                    schema.Example = JsonValue.Create("string");
                }
                else if (underlyingType == typeof(DateTime))
                {
                    schema.Example =
                        JsonValue.Create(DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ",
                            CultureInfo.InvariantCulture));
                }
                else if (underlyingType == typeof(Guid))
                {
                    schema.Example = JsonValue.Create(Guid.NewGuid().ToString());
                }
                else if (underlyingType == typeof(int) || underlyingType == typeof(double) ||
                         underlyingType == typeof(float))
                {
                    schema.Example = JsonValue.Create(0);
                }
                else if (underlyingType == typeof(bool))
                {
                    schema.Example = JsonValue.Create(false);
                }
            }

            return Task.CompletedTask;
        });

        options.AddDocumentTransformer((document, context, cancellationToken) =>
        {
            // Set version info in the document
            document.Info.Title = "Bibently API";
            document.Info.Version = version;
            document.Info.Description = $"Bibently Events API - Version {version}";

            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

            if (!document.Components.SecuritySchemes.ContainsKey("Bearer"))
            {
                document.Components.SecuritySchemes.Add("Bearer", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = "Enter your Firebase ID token."
                });
            }

            document.Security ??= new List<OpenApiSecurityRequirement>();
            document.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
            });

            return Task.CompletedTask;
        });

        options.AddOperationTransformer((operation, context, cancellationToken) =>
        {
            if (operation.Parameters != null)
            {
                foreach (var parameter in operation.Parameters)
                {
                    if (parameter.In == ParameterLocation.Query)
                    {
                        if (parameter is OpenApiParameter p)
                        {
                            p.Example = null;
                        }

                        if (parameter.Schema is OpenApiSchema s)
                        {
                            s.Example = null;
                        }
                    }
                }
            }

            // Manually inject FilterRequest query params for GET /events.
            // FilterRequest uses BindAsync for custom keyword parsing, which prevents
            // ASP.NET Core's OpenAPI generator from discovering its properties automatically.
            var isGetEvents = context.Description.HttpMethod?.Equals("GET", StringComparison.OrdinalIgnoreCase) == true
                && context.Description.RelativePath?.TrimStart('/').Equals("api/v1/events", StringComparison.OrdinalIgnoreCase) == true;

            if (isGetEvents)
            {
                if (operation.Parameters is null)
                {
                    operation.Parameters = new List<IOpenApiParameter>();
                }

                IOpenApiParameter[] filterParams =
                [
                    new OpenApiParameter { Name = "city",      In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.String } },
                    new OpenApiParameter { Name = "name",      In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.String } },
                    new OpenApiParameter { Name = "category",  In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.String } },
                    new OpenApiParameter { Name = "startDate", In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.String, Format = "date-time" } },
                    new OpenApiParameter { Name = "endDate",   In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.String, Format = "date-time" } },
                    new OpenApiParameter { Name = "minPrice",  In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.Number } },
                    new OpenApiParameter { Name = "maxPrice",  In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.Number } },
                    new OpenApiParameter
                    {
                        Name = "keywords", In = ParameterLocation.Query, Required = false,
                        Description = "Comma-separated list of keywords, e.g. music,outdoor",
                        Schema = new OpenApiSchema { Type = JsonSchemaType.String }
                    },
                    new OpenApiParameter { Name = "latitude",  In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.Number } },
                    new OpenApiParameter { Name = "longitude", In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.Number } },
                    new OpenApiParameter { Name = "radiusKm",  In = ParameterLocation.Query, Required = false, Schema = new OpenApiSchema { Type = JsonSchemaType.Number } },
                ];

                // Prepend filter params before the sort params so they appear first in Scalar
                var existingParams = operation.Parameters.ToList();
                operation.Parameters.Clear();
                foreach (var fp in filterParams)
                {
                    operation.Parameters.Add(fp);
                }
                foreach (var ep in existingParams)
                {
                    operation.Parameters.Add(ep);
                }
            }

            return Task.CompletedTask;
        });
    }

    public static WebApplication MapOpenApiUi(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            // Map OpenAPI endpoint once - it serves all registered document names
            // Documents are available at: /openapi/v1.json, /openapi/v2.json, etc.
            app.MapOpenApi().AllowAnonymous();

            // Configure Scalar with version switching support
            app.MapScalarApiReference(options =>
            {
                options.WithTitle("Bibently API")
                    .WithTheme(ScalarTheme.Moon)
                    .AddHttpAuthentication("BearerAuth", auth =>
                    {
                        auth.Token = "your-firebase-id-token";
                    });

                // Add document selector for version switching
                // Each version will appear in the dropdown
                foreach (var version in SupportedVersions)
                {
                    options.AddDocument(version, $"/openapi/{version}.json");
                }
            }).AllowAnonymous();
        }

        return app;
    }
}
