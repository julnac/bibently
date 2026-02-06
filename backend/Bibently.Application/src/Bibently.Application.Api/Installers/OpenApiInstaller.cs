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
                    // Fix here: Use ParameterLocation directly as namespace is imported
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

            return Task.CompletedTask;
        });
    }

    public static WebApplication MapOpenApiUi(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            // Map OpenAPI endpoint once - it serves all registered document names
            // Documents are available at: /openapi/v1.json, /openapi/v2.json, etc.
            app.MapOpenApi("/openapi/{documentName}.json");

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
            });
        }

        return app;
    }
}
