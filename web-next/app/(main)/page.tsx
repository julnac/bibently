import { Suspense } from 'react';
import HomeContent from './HomeContent';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full overflow-hidden">
          {/* Event List skeleton (full width on mobile, fixed on desktop) */}
          <section className="w-full md:w-[600px] 2xl:w-[660px] p-4 md:p-5 shrink-0">
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-stretch bg-surface rounded-[8px] gap-0 sm:gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  {/* Image Skeleton */}
                  <div className="shrink-0 w-full sm:w-[200px] h-[180px] sm:h-[150px] rounded-t-[8px] sm:rounded-t-none sm:rounded-l-[8px] skeleton" />
                  {/* Content Skeleton */}
                  <div className="flex flex-col flex-1 p-3 sm:p-0 sm:h-[130px] justify-between sm:pr-12 sm:py-1">
                    <div className="space-y-3">
                      <div className="skeleton h-5 w-3/4 rounded" />
                      <div className="skeleton h-4 w-1/3 rounded" />
                      <div className="skeleton h-4 w-1/2 rounded" />
                    </div>
                    <div className="flex items-center justify-between mt-3 sm:mt-0">
                      <div className="skeleton h-4 w-1/4 rounded" />
                      <div className="skeleton h-8 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Map skeleton (desktop only) */}
          <section className="hidden md:block flex-1 bg-surface-hover" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}