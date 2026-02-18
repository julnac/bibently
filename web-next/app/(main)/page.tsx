import { Suspense } from 'react';
import HomeContent from './HomeContent';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full overflow-hidden">
          <aside className="hidden lg:flex flex-col w-[280px] border-r border-border p-5 shrink-0">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          </aside>
          <section className="flex-1 p-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="skeleton aspect-[16/10] w-full rounded-xl" />
                  <div className="pt-3 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="hidden md:block w-[40%] lg:w-[45%] bg-surface" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}