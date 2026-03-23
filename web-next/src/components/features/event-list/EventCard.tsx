import { EventSummary } from '@/src/types/event.types';
import { format, differenceInDays } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { MapPin, Calendar, Globe, Map, Heart, Share2, Users } from 'lucide-react';
import Link from 'next/link';
import { createSlug } from '@/src/utils/url.utils';
import Image from 'next/image';

interface EventCardProps {
    event: EventSummary;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export default function EventCard({
    event,
    isHovered,
    onMouseEnter,
    onMouseLeave,
}: EventCardProps) {
    const formattedDateDay = format(new Date(event.startDate), 'EEEE', { locale: enUS });
    const formattedDateRest = format(new Date(event.startDate), 'd MMM • HH:mm', { locale: enUS });

    const isOnline = event.attendanceMode === 'OnlineEventAttendanceMode';

    const slug = createSlug(event.name, event.id);

    return (
        <article
            className={`
                flex flex-col sm:flex-row items-stretch sm:items-center
                bg-surface rounded-[8px] gap-0 sm:gap-4 relative
                shadow-[0_4px_12px_rgba(0,0,0,0.05)]
                ${isHovered ? 'ring-1 ring-primary/20' : ''}
            `}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* ── Image Section ── */}
            <Link
                href={`/event/${slug}`}
                className="
                    shrink-0 relative
                    w-full sm:w-[200px]
                    h-[150px]
                    rounded-t-[8px] sm:rounded-t-none sm:rounded-l-[8px]
                    overflow-hidden bg-surface-hover
                "
            >
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        fill
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold font-serif bg-surface-secondary text-text-secondary opacity-50">
                        IMAGE
                    </div>
                )}
            </Link>

            {/* Icons block */}
            <div className="absolute top-29 left-2 md:top-auto md:bottom-2 md:left-2 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-surface-hover/80 text-xs text-text-secondary">
                    <Users size={12} />
                    <span>{event.attendeeCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-hover/80 text-xs text-text-secondary">
                    {isOnline ? <Globe size={12} /> : <MapPin size={12} />}
                    <span>{isOnline ? 'online' : 'on-site'}</span>
                </div>
            </div>

            {/* ── Content Section ── */}
            <div className="flex flex-col flex-1 min-w-0 p-3 sm:p-0 sm:h-[130px] justify-between sm:pr-14">
                <Link href={`/event/${slug}`}>
                    {/* Title */}
                    <h3 className={`font-bold text-base mb-1 transition-colors line-clamp-2 ${isHovered ? "text-primary" : "text-text-primary"}`}>
                        {event.name}
                    </h3>

                    {/* Date */}
                    <div className="text-sm font-medium mb-1">
                        {differenceInDays(new Date(event.startDate), new Date()) <= 7 && (
                            <span className="text-primary">{formattedDateDay}</span>
                        )}
                        <span className="text-text-secondary">{differenceInDays(new Date(event.startDate), new Date()) <= 6 ? ', ' : ''}{formattedDateRest}</span>
                    </div>

                    {/* Location */}
                    <div className="text-sm font-medium text-text-secondary line-clamp-1">
                        {event.location?.name || event.location?.address?.city || 'No location set'}
                    </div>
                </Link>

                {/* Bottom Row */}
                <div className="flex items-center justify-between w-full mt-2 sm:mt-auto">

                    {/* Keywords (Tags) */}
                    {event.keywords && event.keywords.length > 0 && (
                        <div className="flex items-center gap-1.5 truncate">
                            {event.keywords.slice(0, 3).map((keyword) => (
                                <span
                                    key={keyword}
                                    className="px-2.5 py-1 rounded-sm text-xs font-semibold italic uppercase bg-surface-hover"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right Action Buttons ── */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:flex-col">
                <button
                    className="w-8 h-8 rounded-full bg-white/80 sm:bg-transparent text-primary border border-primary/50 sm:border-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                    aria-label="Save bookmark"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <Heart size={14} className="fill-transparent" />
                </button>
                <button
                    className="w-8 h-8 rounded-full bg-white/80 sm:bg-transparent text-primary border border-primary/50 sm:border-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                    aria-label="Share"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <Share2 size={14} />
                </button>
            </div>
        </article >
    );
}
