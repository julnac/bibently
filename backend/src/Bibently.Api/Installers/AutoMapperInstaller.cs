namespace Bibently.Application.Installers;

using AutoMapper;
using Bibently.Abstractions;
using Bibently.Application.Models;
using Bibently.Repository.Models;

public static class AutoMapperInstaller
{
    public static IServiceCollection AddAutoMapper(this IServiceCollection serviceCollection)
    {
        var mapperConfig = GetMapperConfiguration();
        serviceCollection.AddSingleton(mapperConfig.CreateMapper());

        return serviceCollection;
    }

    internal static MapperConfiguration GetMapperConfiguration()
        => new(config =>
        {
            config.CreateMap<Event, EventDto>().ReverseMap();
            config.CreateMap<CreateEventRequest, Event>();
            config.CreateMap<Event, EventDocument>().ReverseMap();
        }, new LoggerFactory());
}