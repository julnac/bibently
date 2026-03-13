import { Suspense } from 'react';
import NavBar from '@/src/components/features/navigation/NavBar';
import CategoryBar from '@/src/components/features/filters/category/CategoryBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={<NavBarSkeleton />}>
                <NavBar />
            </Suspense>
            <Suspense fallback={<CategoryBarSkeleton />}>
                <CategoryBar />
            </Suspense>
            <main className="flex-1 relative overflow-hidden">
                {children}
            </main>
        </>
    );
}

function NavBarSkeleton() {
    return (
        <header
            className="glass-nav sticky top-0 z-50 flex items-center justify-between px-6"
            style={{ height: 'var(--nav-height)' }}
        >
            <div className="skeleton w-32 h-8 rounded-lg" />
            <div className="skeleton flex-1 max-w-2xl mx-4 h-12 rounded-full" />
            <div className="skeleton w-10 h-10 rounded-full" />
        </header>
    );
}

function CategoryBarSkeleton() {
    return (
        <div
            className="border-b border-border px-6 flex items-center gap-6"
            style={{ height: 'var(--category-bar-height)' }}
        >
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                    <div className="skeleton w-6 h-6 rounded-full" />
                    <div className="skeleton w-12 h-3 rounded" />
                </div>
            ))}
        </div>
    );
}
