'use client';

import { useEvent } from "@/src/hooks/useEvent";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, MapPin, Ticket, User, ExternalLink, Clock, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { getCategoryIcon } from "@/src/utils/categoryIcons";
import { tCategory } from "@/src/utils/i18n/tCategory";
import Breadcrumbs from "../../ui/Breadcrumbs";
import { useCategories } from "@/src/store/useCategories";

interface EventDetailsProps {
    id: string;
}

export default function EventDetails({ id }: EventDetailsProps) {
    const { data: event, isLoading, error } = useEvent(id);
    const { data: categories } = useCategories();

    const formattedStartDate = useMemo(() => {
        if (!event?.startDate) return '';
        return format(new Date(event.startDate), 'EEEE, d MMMM yyyy, HH:mm', { locale: pl });
    }, [event?.startDate]);

    const formattedEndDate = useMemo(() => {
        if (!event?.endDate) return null;
        return format(new Date(event.endDate), 'HH:mm');
    }, [event?.endDate]);

    const googleMapsUrl = useMemo(() => {
        if (!event?.location) return '';
        const query = encodeURIComponent(`${event.location.address.street || ''}, ${event.location.address.city || ''}`);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }, [event?.location]);

    if (isLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-pulse">
                <div className="h-6 mb-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-64 md:h-96 bg-gray-200 rounded-xl mb-8"></div>
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded w-full mt-8"></div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Nie udało się załadować wydarzenia</h2>
                <p className="text-gray-600 mb-6">Wydarzenie może nie istnieć lub wystąpił błąd połączenia.</p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                    Wróć na stronę główną
                </Link>
            </div>
        );
    }

    const CategoryIcon = getCategoryIcon(event.category || 'event');

    const categoryConfig = categories?.find(c => c.value === event.category);
    const translationKey = categoryConfig?.translationKey || event.category || 'event';
    const categoryName = tCategory(translationKey);

    const breadcrumbItems = [
        { label: 'Wszystkie wydarzenia', href: '/' },
        ...(event.location?.address?.city
            ? [{ label: event.location.address.city, href: `/?city=${event.location.address.city}` }]
            : []),
        { label: categoryName, href: `/?category=${event.category}` },
        { label: event.name }
    ];

    return (
        <article className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10 pb-20">
            <div className="mb-10">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* Header / Hero */}
            <header className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                    {/* Left Column: Info */}
                    <div className="flex flex-col justify-center h-full order-2 md:order-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <CategoryIcon size={14} />
                                {categoryName}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
                            {event.name}
                        </h1>

                        <div className="flex flex-col gap-4 text-gray-600 mb-8">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary shrink-0" />
                                <time className="text-md font-medium">
                                    {formattedStartDate}
                                    {formattedEndDate && ` - ${formattedEndDate}`}
                                </time>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                                <div>
                                    <address className="not-italic text-md font-medium text-gray-900">
                                        {event.location?.name}
                                    </address>
                                    <p className="not-italic text-gray-600 text-sm">
                                        {[
                                            event.location?.address.street,
                                            event.location?.address.city
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                    {googleMapsUrl && (
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1"
                                        >
                                            Pokaż na mapie <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Price Tag (Moved here for better context in split layout) */}
                        <div className="flex items-center gap-3">
                            <div className="bg-surface px-4 py-2 inline-flex items-center gap-3">
                                <span className="text-xs text-text-secondary uppercase font-bold tracking-wide">Cena</span>
                                <span className="text-xl font-bold text-primary">
                                    {event.offer?.price === 0 ? 'Darmowe' : `${event.offer?.price} ${event.offer?.currency || 'PLN'}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="relative w-full aspect-[4/3] md:aspect-square lg:aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm order-1 md:order-2">
                        {event.imageUrl ? (
                            <Image
                                src={event.imageUrl}
                                alt={event.name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 text-primary/30">
                                <CategoryIcon size={64} opacity={0.5} />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-10">
                    {/* Description */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            O wydarzeniu
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {event.description}
                        </div>
                        {event.articleBody && (
                            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed mt-6 whitespace-pre-line">
                                {event.articleBody}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="md:col-span-1 space-y-8">
                    {/* Action Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Szczegóły</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <User size={16} /> Organizator
                                </span>
                                <span className="font-medium text-right text-sm">
                                    {event.organizer?.name || event.performer?.name || 'Nieznany'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <Clock size={16} /> Czas trwania
                                </span>
                                <span className="font-medium text-right text-sm">
                                    {formattedEndDate ? 'Określony' : 'Nie podano'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <Ticket size={16} /> Typ wydarzenia
                                </span>
                                <span className="font-medium text-right text-sm">
                                    {event.attendanceMode === 'OfflineEventAttendanceMode' ? 'Stacjonarne' : 'Online'}
                                </span>
                            </div>
                        </div>

                        {event.offer?.url ? (
                            <a
                                href={event.offer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow"
                            >
                                <Ticket size={18} />
                                Zapisz się
                            </a>
                        ) : (
                            <button
                                disabled
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
                            >
                                Brak linku do biletów
                            </button>
                        )}
                    </div>

                    {/* Keywords */}
                    {event.keywords && event.keywords.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Tagi</h3>
                            <div className="flex flex-wrap gap-2">
                                {event.keywords.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors cursor-default">
                                        <Tag size={12} className="mr-1.5 opacity-60" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </article>
    );
}
