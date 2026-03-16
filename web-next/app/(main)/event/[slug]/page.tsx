import type { Metadata } from 'next';
import EventDetails from '@/src/components/features/event-details/EventDetails';
import { extractIdFromSlug } from '@/src/utils/url.utils';
import { eventService } from '@/src/services/events.service';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const id = extractIdFromSlug(slug);

    try {
        const event = await eventService.getEventById(id);

        return {
            title: `${event.name} | Bibently`,
            description: event.description?.substring(0, 160) || 'Szczegóły wydarzenia na platformie Bibently',
            openGraph: {
                title: event.name,
                description: event.description || undefined,
                images: event.imageUrl ? [event.imageUrl] : [],
                type: 'website',
            },
        };
    } catch (error) {
        return {
            title: 'Wydarzenie | Bibently',
            description: 'Szczegóły wydarzenia',
        };
    }
}

export default async function EventPage({ params }: Props) {
    const { slug } = await params;
    const id = extractIdFromSlug(slug);

    let jsonLd = null;
    try {
        const event = await eventService.getEventById(id);
        if (event) {
            jsonLd = {
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: event.name,
                startDate: event.startDate,
                endDate: event.endDate,
                eventStatus: event.eventStatus ? `https://schema.org/${event.eventStatus}` : undefined,
                eventAttendanceMode: event.attendanceMode ? `https://schema.org/${event.attendanceMode}` : undefined,
                location: {
                    '@type': 'Place',
                    name: event.location.name,
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: event.location.address.street,
                        addressLocality: event.location.address.city,
                    }
                },
                image: event.imageUrl ? [event.imageUrl] : undefined,
                description: event.description,
                offers: {
                    '@type': 'Offer',
                    price: event.offer.price,
                    priceCurrency: event.offer.currency,
                    url: event.offer.url,
                    availability: event.offer.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                },
                organizer: {
                    '@type': 'Organization',
                    name: event.organizer?.name || event.performer?.name,
                    url: event.organizer?.url || event.performer?.url
                }
            };
        }
    } catch (e) {

    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <EventDetails id={id} />
        </>
    );
}
