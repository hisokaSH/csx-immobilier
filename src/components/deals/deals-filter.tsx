'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { STAGE_CONFIG, DealStage } from '@/types';
import { cn } from '@/lib/utils';

export function DealsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [stage, setStage] = useState(searchParams.get('stage') || '');
  const [clientType, setClientType] = useState(searchParams.get('type') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ q: search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/deals?${params.toString()}`);
  };

  const handleStageChange = (value: string) => {
    setStage(value);
    updateParams({ stage: value });
  };

  const handleTypeChange = (value: string) => {
    setClientType(value);
    updateParams({ type: value });
  };

  const clearFilters = () => {
    setSearch('');
    setStage('');
    setClientType('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('stage');
    params.delete('type');
    router.push(`/deals?${params.toString()}`);
  };

  const hasFilters = search || stage || clientType;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-200" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                updateParams({ q: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-200 hover:text-ink-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            showFilters || hasFilters
              ? 'bg-brand-50 border-brand-200 text-brand-700'
              : 'bg-white border-surface-200 text-ink-400 hover:border-surface-300'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {[search, stage, clientType].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-ink-300 hover:text-ink-500"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg animate-in">
          {/* Stage Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink-400">Stage:</label>
            <select
              value={stage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="text-sm bg-white border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All stages</option>
              {Object.entries(STAGE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Client Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-ink-400">Type:</label>
            <select
              value={clientType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="text-sm bg-white border border-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All types</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
