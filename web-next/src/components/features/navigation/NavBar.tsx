'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import { Plus, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function NavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <header
                className="relative z-[1001] flex items-center justify-end md:justify-between px-4 md:px-6 bg-surface-hover"
                style={{ height: 'var(--nav-height)' }}
            >
                {/* ── Logo ── */}
                <Link href="/" className="hidden md:flex items-center gap-2 shrink-0">
                    <span className="text-[20px] uppercase font-extrabold tracking-normal text-text-primary">Bibently</span>
                </Link>

                {/* ── Search Bar (hidden on mobile, shown on md+) ── */}
                <div className="hidden md:flex flex-1">
                    <SearchBar />
                </div>

                {/* ── User Actions (desktop) ── */}
                <div className="hidden md:flex items-center gap-3 shrink-0 ml-4">
                    <button className="flex items-center gap-2 text-xs px-4 pl-4 h-10 bg-surface border border-border rounded-full hover:bg-surface-hover transition-colors">
                        <Search size={15} />
                        <span >Search</span>
                    </button>
                    <button className="flex items-center gap-2 text-xs px-4 h-10 bg-surface border border-border rounded-full hover:bg-surface-hover transition-colors">
                        <Plus size={15} />
                        <span >Post event</span>
                    </button>
                    <button
                        className="flex items-center justify-center text-xs tracking-wide px-4 h-10 rounded-full text-white bg-brand-accent hover:opacity-90 transition-opacity shadow-md"
                    >
                        <span >Sign in</span>
                    </button>
                </div>

                {/* ── Mobile: Search icon + Menu button ── */}
                <div className="flex md:hidden items-center gap-2">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {/* ── Mobile Search Bar (below navbar) ── */}
            <div className="md:hidden relative z-[1001] px-4 pb-3 bg-surface-hover">
                <SearchBar />
            </div>

            {/* ── Mobile Menu Overlay ── */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-[2px] md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed top-[var(--nav-height)] right-0 z-[1000] w-64 bg-surface border-l border-border shadow-xl md:hidden animate-slideInRight">
                        <nav className="flex flex-col p-4 gap-2">
                            <button className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors text-text-primary">
                                <Search size={18} />
                                <span>Search</span>
                            </button>
                            <button className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors text-text-primary">
                                <Plus size={18} />
                                <span>Post event</span>
                            </button>
                            <div className="border-t border-border my-2" />
                            <button className="flex items-center justify-center text-sm px-4 py-3 rounded-full text-white bg-brand-accent hover:opacity-90 transition-opacity shadow-md">
                                Sign in
                            </button>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}