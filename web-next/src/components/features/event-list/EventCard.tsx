import { EventEntity } from '@/src/types/event.types';

interface EventCardProps {
    event: EventEntity;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

/**
 * Dumb presentational EventCard — receives all data via props.
 * Ready for future NativeWind/shared migration.
 */
export default function EventCard({
    event,
    isHovered,
    onMouseEnter,
    onMouseLeave,
}: EventCardProps) {
    const formattedDate = new Date(event.startDate).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const price =
        event.offer?.price === 0
            ? 'Za darmo'
            : event.offer?.price
                ? `${event.offer.price} ${event.offer.currency || 'PLN'}`
                : null;

    return (
        <article
            className={`event-card rounded-xl overflow-hidden cursor-pointer group ${isHovered ? 'event-card--active ring-2 ring-primary/30' : ''
                }`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* ── Image ── */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/10 to-primary/5">
                        🎉
                    </div>
                )}

                {/* Category Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-text-primary shadow-sm">
                    {event.category}
                </span>

                {/* Favourite Button */}
                <button
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    aria-label="Dodaj do ulubionych"
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                </button>
            </div>

            {/* ── Info ── */}
            <div className="pt-3 pb-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-text-primary text-[15px] line-clamp-1 leading-snug">
                        {event.name}
                    </h3>
                </div>

                <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <span className="line-clamp-1">
                        {event.location?.name || event.location?.address?.city || 'Lokalizacja nieznana'}
                    </span>
                </p>

                <p className="text-sm text-text-secondary mt-0.5">{formattedDate}</p>

                {price && (
                    <p className="text-sm font-semibold text-text-primary mt-1">{price}</p>
                )}
            </div>
        </article>
    );
}