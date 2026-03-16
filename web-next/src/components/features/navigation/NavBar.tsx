'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import { Plus } from 'lucide-react';

export default function NavBar() {
    return (
        <header
            className="relative z-[1001] flex items-center justify-between px-6 bg-surface-hover"
            style={{ height: 'var(--nav-height)' }}
        >
            <div className="flex items-center gap-4 flex-1 w-full">
                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className="font-serif text-[20px] font-bold text-text-primary">Bibently</span>
                </Link>

                {/* ── Search Bar Wrapper ── */}
                <div className="hidden lg:flex items-center flex-1 max-w-5xl mr-auto">
                    <SearchBar />
                </div>
            </div>

            {/* ── User Actions ── */}
            <div className="flex items-center gap-3 shrink-0 ml-4">
                <button className="hidden md:flex items-center gap-2 text-xs font-mono px-7 h-11 bg-surface border border-border rounded-full hover:bg-surface-hover transition-colors">
                    <Plus size={15} />
                    <span className='text-mono text-sm'>Post event</span>
                </button>
                <button
                    className="flex items-center justify-center text-xs font-mono tracking-wide px-7 h-11 rounded-full text-white bg-brand-accent hover:opacity-90 transition-opacity shadow-md"
                >
                    <span className='text-mono text-sm'>Sign in</span>
                </button>
            </div>
        </header>
    );
}