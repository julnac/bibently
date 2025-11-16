namespace Bibently.Application.Installers;

using Bibently.Application.Extensions;
using Bibently.Application.Options;
using Bibently.Repository;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

public static class MongoInstaller
{
    public static IServiceCollection AddMongo(
        this IServiceCollection services,
        IConfiguration manager)
    {
        BsonSerializer.TryRegisterSerializer(
            new GuidSerializer(GuidRepresentation.Standard)
        );
        
        services.AddOptionsAndValidate<EventsRepositoryOptions>(
            manager.GetSection(EventsRepositoryOptions.SectionName));
        services.Configure<EventsRepositoryOptions>(manager.GetSection(EventsRepositoryOptions.SectionName));
        
        var options = manager
            .GetSection(EventsRepositoryOptions.SectionName)
            .Get<EventsRepositoryOptions>()!;
        
        var connectionString = options.ConnectionString ?? throw new InvalidOperationException("ConnectionString is required");
        var databaseName = options.DatabaseName ?? throw new InvalidOperationException("DatabaseName is required");
        
        services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));
        
        services.AddScoped<IMongoDatabase>(provider =>
        {
            var client = provider.GetRequiredService<IMongoClient>();
            return client.GetDatabase(databaseName);
        });
        
        services.AddScoped<IEventsRepository, EventsRepository>();

        return services;
    }
}
