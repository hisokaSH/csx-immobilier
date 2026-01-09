import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Deal, STAGE_CONFIG } from '@/types';
import { DealsTable } from '@/components/deals/deals-table';
import { PipelineView } from '@/components/deals/pipeline-view';
import { NewDealButton } from '@/components/deals/new-deal-button';
import { ViewToggle } from '@/components/deals/view-toggle';
import { DealsFilter } from '@/components/deals/deals-filter';
import { CSVImport } from '@/components/deals/csv-import';
import { Briefcase } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DealsPageProps {
  searchParams: Promise<{ view?: string; q?: string; stage?: string; type?: string }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const view = params.view || 'table';
  const searchQuery = params.q?.toLowerCase() || '';
  const stageFilter = params.stage || '';
  const typeFilter = params.type || '';
  
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all user's deals
  const { data: allDeals } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  // Apply filters
  let deals = (allDeals as Deal[]) || [];
  
  if (searchQuery) {
    deals = deals.filter(deal => 
      deal.client_name.toLowerCase().includes(searchQuery) ||
      deal.property_address?.toLowerCase().includes(searchQuery) ||
      deal.client_email?.toLowerCase().includes(searchQuery)
    );
  }
  
  if (stageFilter) {
    deals = deals.filter(deal => deal.deal_stage === stageFilter);
  }
  
  if (typeFilter) {
    deals = deals.filter(deal => deal.client_type === typeFilter);
  }

  const totalDeals = allDeals?.length || 0;
  const filteredCount = deals.length;
  const hasFilters = searchQuery || stageFilter || typeFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-600">Deals</h1>
          <p className="text-ink-200 mt-1">
            {hasFilters 
              ? `Showing ${filteredCount} of ${totalDeals} deals`
              : `Manage your clients and deal pipeline`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle currentView={view} />
          <CSVImport />
          <NewDealButton />
        </div>
      </div>

      {/* Search & Filter */}
      {totalDeals > 0 && <DealsFilter />}

      {/* Deals View */}
      {deals.length > 0 ? (
        view === 'pipeline' ? (
          <PipelineView deals={deals} />
        ) : (
          <DealsTable deals={deals} />
        )
      ) : totalDeals > 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-surface-200">
          <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-ink-200" />
          </div>
          <h3 className="text-lg font-medium text-ink-500 mb-1">No matches found</h3>
          <p className="text-ink-200">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-surface-200">
          <div className="w-16 h-16 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-ink-200" />
          </div>
          <h3 className="text-lg font-medium text-ink-500 mb-1">No deals yet</h3>
          <p className="text-ink-200 mb-6 max-w-sm mx-auto">
            Add your first client to start generating follow-up messages
          </p>
          <NewDealButton />
        </div>
      )}
    </div>
  );
}
