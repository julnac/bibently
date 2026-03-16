import {
    Calendar,
    Music,
    Drama,
    Trophy,
    Briefcase,
    GraduationCap,
    Palette,
    Tent,
    Users,
    Music2,
    Smile,
    Baby,
    BookOpen,
    Film,
    Utensils,
    LucideIcon
} from 'lucide-react';

export const getCategoryIcon = (category: string): LucideIcon => {
    switch (category.toLowerCase()) {
        case 'music_event':
            return Music;
        case 'theater_event':
            return Drama;
        case 'sports_event':
            return Trophy;
        case 'business_event':
            return Briefcase;
        case 'education_event':
            return GraduationCap;
        case 'exhibition_event':
            return Palette;
        case 'festival':
            return Tent;
        case 'social_event':
            return Users;
        case 'dance_event':
            return Music2;
        case 'comedy_event':
            return Smile;
        case 'childrens_event':
            return Baby;
        case 'literary_event':
            return BookOpen;
        case 'screening_event':
            return Film;
        case 'food_event':
            return Utensils;
        default:
            return Calendar;
    }
};
