namespace Bibently.Application.Abstractions.Models;

using System.Globalization;
using System.Reflection;
using Microsoft.AspNetCore.Http;

public class FilterRequest
{
    public string? City { get; init; }
    public string? Name { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public double? MinPrice { get; init; }
    public double? MaxPrice { get; init; }
    public string? Category { get; init; }
    public string[]? Keywords { get; init; } = [];
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
    public double? RadiusKm { get; init; }

    /// <summary>
    /// Custom binding to handle comma-separated values for the `keywords` query parameter.
    /// IMPORTANT: This method overrides the default binding behavior. If you add new properties to <see cref="FilterRequest"/>,
    /// you MUST manually parse and bind them here, otherwise they will be null.
    /// </summary>
    public static ValueTask<FilterRequest?> BindAsync(HttpContext context, ParameterInfo parameter)
    {
        var query = context.Request.Query;

        var city = query["city"].ToString();
        var name = query["name"].ToString();
        var category = query["category"].ToString();

        DateTime? startDate = DateTime.TryParse(query["startDate"], CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var start) ? start : null;
        DateTime? endDate = DateTime.TryParse(query["endDate"], CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var end) ? end : null;

        double? minPrice = double.TryParse(query["minPrice"], NumberStyles.Any, CultureInfo.InvariantCulture, out var min) ? min : null;
        double? maxPrice = double.TryParse(query["maxPrice"], NumberStyles.Any, CultureInfo.InvariantCulture, out var max) ? max : null;

        double? latitude = double.TryParse(query["latitude"], NumberStyles.Any, CultureInfo.InvariantCulture, out var lat) ? lat : null;
        double? longitude = double.TryParse(query["longitude"], NumberStyles.Any, CultureInfo.InvariantCulture, out var lon) ? lon : null;
        double? radiusKm = double.TryParse(query["radiusKm"], NumberStyles.Any, CultureInfo.InvariantCulture, out var rad) ? rad : null;

        // Custom binding for Keywords: split by comma if present
        var keywordsValues = query["keywords"];
        var keywordsList = new List<string>();
        foreach (var val in keywordsValues)
        {
            if (string.IsNullOrWhiteSpace(val))
            {
                continue;
            }
            if (val.Contains(',', StringComparison.InvariantCulture))
            {
                keywordsList.AddRange(val.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
            }
            else
            {
                keywordsList.Add(val);
            }
        }

        var result = new FilterRequest
        {
            City = string.IsNullOrEmpty(city) ? null : city,
            Name = string.IsNullOrEmpty(name) ? null : name,
            Category = string.IsNullOrEmpty(category) ? null : category,
            StartDate = startDate,
            EndDate = endDate,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            Keywords = keywordsList.Count > 0 ? [.. keywordsList] : [],
            Latitude = latitude,
            Longitude = longitude,
            RadiusKm = radiusKm
        };

        return ValueTask.FromResult<FilterRequest?>(result);
    }
}
