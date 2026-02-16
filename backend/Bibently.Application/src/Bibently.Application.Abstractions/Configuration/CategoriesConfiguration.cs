namespace Bibently.Application.Abstractions.Configuration;

public record CategoryDefinition(string Value, string Title, string TranslationKey);

public static class CategoriesConfiguration
{
    // Value is the database key (e.g., "MusicEvent").
    // TranslationKey is the unique pointer for localization (e.g., "categories.music_event").
    // Title is essentially the English default or fallback display name.

    // Recommended Approaches for Multi-language Support
    // You have two main paths, depending on where you want the "translation source of truth" to live:

    // Option A: Frontend-Driven Translation (Standard for SPAs)
    // This is what I recommended earlier with the TranslationKey.

    // Backend: Returns just the TranslationKey (e.g., "categories.music_event").
    // Frontend: Has pl.json, en.json, etc., and maps the key to the text.
    // Pros: Decoupled backend; frontend handles all display logic; zero backend changes for new languages.
    // Cons: Frontend needs to keep its translation files in sync with backend keys.
    // Option B: Backend-Driven Translation (Dynamic)
    // If you want the API to return the actual translated text based on the user's Accept-Language header:

    // Resource Files: Create .resx files (e.g., Categories.en.resx, Categories.pl.resx) in your backend.
    // Endpoint Logic:
    // Inject IStringLocalizer<Categories>.
    // In your /configuration/categories endpoint, iterate through CategoriesConfiguration.All.
    // For each category, look up the translation using Title or Value as the key.
    // Return a localized list: [{ value: "MusicEvent", title: "Koncerty" }].
    // Which one to choose?
    // Choose Option A (Frontend) if you are building a modern React/Vue/Angular app. It is the industry standard for Single Page Applications. The backend provides the structure (IDs and Keys), and the frontend provides the presentation (Language).
    // Choose Option B (Backend) if you have mobile apps or third-party consumers that can't easily update their translation files, or if you are doing server-side rendering (Razor Pages/MVC).
    // Given your current setup with TranslationKey, Option A is the most natural fit. You don't need to add Polish text to
    // CategoriesConfiguration.cs
    // ; you just need to ensure your frontend has a translation file that maps categories.music_event to "Koncerty".

    public static readonly IReadOnlyList<CategoryDefinition> All = new List<CategoryDefinition>
    {
        new("Event", "General Event", "categories.event"),
        new("MusicEvent", "Music", "categories.music_event"),
        new("TheaterEvent", "Theater", "categories.theater_event"),
        new("SportsEvent", "Sports", "categories.sports_event"),
        new("BusinessEvent", "Business", "categories.business_event"),
        new("EducationEvent", "Education", "categories.education_event"),
        new("ExhibitionEvent", "Exhibition", "categories.exhibition_event"),
        new("Festival", "Festival", "categories.festival"),
        new("SocialEvent", "Social", "categories.social_event"),
        new("DanceEvent", "Dance", "categories.dance_event"),
        new("ComedyEvent", "Comedy", "categories.comedy_event"),
        new("ChildrensEvent", "Children", "categories.childrens_event"),
        new("LiteraryEvent", "Literary", "categories.literary_event"),
        new("ScreeningEvent", "Screening", "categories.screening_event"),
        new("FoodEvent", "Food & Drink", "categories.food_event")
    }.AsReadOnly();

    public static readonly HashSet<string> ValidValues = All.Select(x => x.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);
}
