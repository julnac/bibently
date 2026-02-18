'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';

export default function NavBar() {
    return (
        <header
            className="glass-nav sticky top-0 z-50 flex items-center justify-between px-6"
            style={{ height: 'var(--nav-height)' }}
        >
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                    </svg>
                </div>
                <span className="text-xl font-bold hidden sm:inline" style={{ color: 'var(--primary)' }}>
                    Bibently
                </span>
            </Link>

            {/* ── Search Bar (center) ── */}
            <div className="flex-1 max-w-2xl mx-4">
                <SearchBar />
            </div>

            {/* ── User Actions ── */}
            <div className="flex items-center gap-3 shrink-0">
                <button className="hidden md:flex items-center text-sm font-medium text-text-primary hover:bg-surface rounded-full px-4 py-2 transition-colors">
                    Dodaj wydarzenie
                </button>
                <button
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-border hover:shadow-md transition-shadow"
                    style={{ background: 'var(--surface)' }}
                    aria-label="Menu użytkownika"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M20 21a8 8 0 00-16 0" />
                    </svg>
                </button>
            </div>
        </header>
    );
}