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
            className={`flex items-center bg-surface rounded-[16px] gap-4 relative shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${isHovered ? 'ring-1 ring-primary/20' : ''
                }`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* ── Image Section (Left) ── */}
            <Link href={`/event/${slug}`} className="shrink-0 relative w-[200px] h-[150px] rounded-l-[16px] overflow-hidden bg-surface-hover">
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

            {/* ── Content Section (Middle) ── */}
            <div className="flex flex-col flex-1 h-[130px] justify-between min-w-0 pr-12">
                <Link href={`/event/${slug}`}>
                    {/* Title */}
                    <h3 className={`font-bold text-base line-clamp-1 mb-1 transition-colors ${isHovered ? "text-primary" : "text-text-primary"}`}>
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
                    <div className="text-sm font-medium text-text-secondary line-clamp-1 mb-3">
                        {event.location?.name || event.location?.address?.city || 'No location set'}
                    </div>
                </Link>

                {/* Bottom Row */}
                <div className="flex items-center justify-between w-full mt-auto">
                    {/* Icons block */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface border border-border text-xs font-mono text-text-secondary">
                            <Users size={12} />
                            <span>{event.attendeeCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-xs font-mono text-text-secondary">
                            {isOnline ? <Globe size={12} /> : <MapPin size={12} />}
                            <span>{isOnline ? 'online' : 'on-site'}</span>
                        </div>
                    </div>

                    {/* Keywords (Tags) */}
                    {event.keywords && event.keywords.length > 0 && (
                        <div className="flex items-center gap-1.5 hidden sm:flex truncate">
                            {event.keywords.slice(0, 3).map((keyword) => (
                                <span
                                    key={keyword}
                                    className="px-2.5 py-1 rounded-md border border-border text-[10px] font-mono tracking-wide text-text-secondary bg-transparent"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right Action Buttons ── */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    className="w-8 h-8 rounded-lg bg-text-secondary text-white flex items-center justify-center hover:bg-foreground transition-colors shadow-sm"
                    aria-label="Save bookmark"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <Heart size={14} className="fill-transparent" />
                </button>
                <button
                    className="w-8 h-8 rounded-lg bg-text-secondary text-white flex items-center justify-center hover:bg-foreground transition-colors shadow-sm"
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
