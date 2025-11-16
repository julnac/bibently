using Bibently.Application.Installers;
using Bibently.Application.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddScoped<IEventsService, EventsService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper();
builder.Services.AddMongo(builder.Configuration);

var app = builder.Build();

var a = app.Configuration;

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();