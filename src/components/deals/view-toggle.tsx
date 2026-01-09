'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: string;
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`/deals?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-lg">
      <button
        onClick={() => setView('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
          currentView === 'table'
            ? 'bg-white text-ink-500 shadow-sm'
            : 'text-ink-300 hover:text-ink-400'
        )}
      >
        <List className="w-4 h-4" />
        Table
      </button>
      <button
        onClick={() => setView('pipeline')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all',
          currentView === 'pipeline'
            ? 'bg-white text-ink-500 shadow-sm'
            : 'text-ink-300 hover:text-ink-400'
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        Pipeline
      </button>
    </div>
  );
}
