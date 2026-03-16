'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useCategories } from '@/src/store/useCategories';
import CategoryButton from './CategoryButton';
import { tCategory } from '@/src/utils/i18n/tCategory';
import { getCategoryIcon } from '@/src/utils/categoryIcons';
import { LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function CategoryBar() {
    const { params, setCategory } = useSearchFilters();
    const { data: categories, isLoading, error } = useCategories();
    const [isMounted, setIsMounted] = useState(false);
    
    // Scrolling states
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const checkScrollable = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        if (!isMounted || isLoading) return;
        
        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        return () => window.removeEventListener('resize', checkScrollable);
    }, [isMounted, isLoading, categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const targetScroll = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    if (!isMounted || isLoading) {
        return <CategoryBarSkeleton />;
    }

    if (error) {
        console.error("Failed to load categories", error);
    }

    const allCategories = [
        { value: null, title: 'All Events', icon: LayoutGrid },
        ...(categories?.map(cat => {
            const translationKey = cat.translationKey || '';
            const keyWithoutPrefix = translationKey.replace('categories.', '');
            // Let's force English layout text (fallback logic handled on map context originally)
            // or rely on translation if it uses enUS logic
            const translated = tCategory(translationKey);

            const finalTitle = (translated && translated !== keyWithoutPrefix)
                ? translated
                : cat.title;

            const iconKey = keyWithoutPrefix || cat.value || 'event';
            const Icon = getCategoryIcon(iconKey);

            return {
                value: cat.value,
                title: finalTitle,
                icon: Icon
            };
        }) || [])
    ];

    return (
        <div className="w-full relative z-10 p-4">
            {/* Scroll Buttons wrapper to handle gradient overlays & positioning */}
            <div className="relative group flex items-center w-full">
                
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md text-text-primary hover:bg-surface border border-border transition-all -translate-x-2"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                {/* Left Fade */}
                {canScrollLeft && (
                    <div className="absolute left-0 w-8 h-full bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
                )}

                {/* Scroll Container */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={checkScrollable}
                    className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar snap-x scroll-smooth mx-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {allCategories.map((cat) => {
                        const isActive = params.category === cat.value;

                        return (
                            <div key={cat.value || 'all'} className="snap-start shrink-0">
                                <CategoryButton
                                    name={cat.title}
                                    isActive={isActive}
                                    onClick={() => setCategory(cat.value)}
                                    icon={cat.icon}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Right Fade */}
                {canScrollRight && (
                    <div className="absolute right-0 w-8 h-full bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md text-text-primary hover:bg-surface border border-border transition-all translate-x-3"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={16} />
                    </button>
                )}

            </div>
        </div>
    );
}

function CategoryBarSkeleton() {
    return (
        <div className="w-full relative z-10 p-4">
            <div className="flex items-center gap-2 overflow-x-hidden">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-9 w-24 rounded-md bg-surface-hover animate-pulse shrink-0" />
                ))}
            </div>
        </div>
    );
}