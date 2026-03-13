'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import CategoryButton from './CategoryButton';

const CATEGORIES = [
    { name: 'Wszystkie', icon: '🎉' },
    { name: 'Koncerty', icon: '🎵' },
    { name: 'Teatr', icon: '🎭' },
    { name: 'Sport', icon: '⚽' },
    { name: 'Wystawy', icon: '🖼️' },
    { name: 'Stand-up', icon: '🎤' },
    { name: 'Festiwale', icon: '🎪' },
    { name: 'Warsztaty', icon: '🔧' },
    { name: 'Kino', icon: '🎬' },
    { name: 'Dla dzieci', icon: '👶' },
    { name: 'Networking', icon: '🤝' },
    { name: 'Jedzenie', icon: '🍕' },
    { name: 'Outdoor', icon: '🏞️' },
];

export default function CategoryBar() {
    const { params, setCategory } = useSearchFilters();

    return (
        <div
            className="border-b border-border px-6 flex items-center shrink-0"
            style={{ height: 'var(--category-bar-height)' }}
        >
            <div className="flex gap-6 overflow-x-auto category-scroll py-2 w-full">
                {CATEGORIES.map((cat) => {
                    const isActive =
                        cat.name === 'Wszystkie'
                            ? !params.category
                            : params.category === cat.name;

                    return (
                        <CategoryButton
                            key={cat.name}
                            name={cat.name}
                            icon={cat.icon}
                            isActive={isActive}
                            onClick={() =>
                                setCategory(cat.name === 'Wszystkie' ? null : cat.name)
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}