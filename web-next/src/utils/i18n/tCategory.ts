import { categoryTranslations } from "./categories";

interface CategoryTranslations {
    [key: string]: {
        categories: {
            [key: string]: string;
        };
    };
}

export function tCategory(
    translationKey: string,
    lang: "pl" | "en" = "pl"
) {
    const key = translationKey.replace("categories.", "")

    return (
        (categoryTranslations as CategoryTranslations)[lang]?.categories?.[key] ??
        (categoryTranslations as CategoryTranslations).en.categories[key] ??
        key
    )
}
