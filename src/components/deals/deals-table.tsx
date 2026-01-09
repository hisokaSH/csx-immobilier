'use client';

import Link from 'next/link';
import { Deal, STAGE_CONFIG } from '@/types';
import { Badge } from '@/components/ui';
import { formatDistanceToNow, format } from 'date-fns';
import { calculateUrgency } from '@/lib/urgency';
import { ChevronRight, User, MapPin, Archive, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface DealsTableProps {
  deals: Deal[];
}

export function DealsTable({ deals }: DealsTableProps) {
  const [showArchived, setShowArchived] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const activeDeals = deals.filter((d) => !d.archived);
  const archivedDeals = deals.filter((d) => d.archived);
  const displayedDeals = showArchived ? archivedDeals : activeDeals;

  const handleArchive = async (dealId: string, archive: boolean) => {
    await supabase
      .from('crm_deals')
      .update({ archived: archive })
      .eq('id', dealId);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-50 rounded-lg w-fit">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            !showArchived
              ? 'bg-white text-ink-500 shadow-sm'
              : 'text-ink-200 hover:text-ink-400'
          }`}
        >
          Active ({activeDeals.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            showArchived
              ? 'bg-white text-ink-500 shadow-sm'
              : 'text-ink-200 hover:text-ink-400'
          }`}
        >
          Archived ({archivedDeals.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="text-left text-xs font-medium text-ink-300 uppercase tracking-wide px-4 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-medium text-ink-300 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                  Property
                </th>
                <th className="text-left text-xs font-medium text-ink-300 uppercase tracking-wide px-4 py-3">
                  Stage
                </th>
                <th className="text-left text-xs font-medium text-ink-300 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                  Last Contact
                </th>
                <th className="text-left text-xs font-medium text-ink-300 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                  Status
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {displayedDeals.map((deal) => {
                const dealWithUrgency = calculateUrgency(deal);
                const stageConfig = STAGE_CONFIG[deal.deal_stage];
                const urgencyColors = {
                  overdue: 'danger',
                  due_today: 'warning',
                  upcoming: 'success',
                } as const;

                return (
                  <tr
                    key={deal.id}
                    className="hover:bg-surface-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/deal/${deal.id}`} className="block">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface-50 rounded-lg group-hover:bg-surface-100 transition-colors">
                            <User className="w-4 h-4 text-ink-300" />
                          </div>
                          <div>
                            <p className="font-medium text-ink-500">
                              {deal.client_name}
                            </p>
                            <p className="text-xs text-ink-200 capitalize">
                              {deal.client_type}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Link href={`/deal/${deal.id}`} className="block">
                        {deal.property_address ? (
                          <div className="flex items-center gap-1.5 text-sm text-ink-300">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {deal.property_address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-ink-100">—</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/deal/${deal.id}`} className="block">
                        <span className="inline-flex text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded">
                          {stageConfig.label}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Link href={`/deal/${deal.id}`} className="block">
                        <span className="text-sm text-ink-300">
                          {formatDistanceToNow(new Date(deal.last_contact_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {!deal.archived && (
                        <Badge variant={urgencyColors[dealWithUrgency.urgency]}>
                          {dealWithUrgency.urgency === 'overdue'
                            ? `${dealWithUrgency.days_since_contact - dealWithUrgency.follow_up_days}d overdue`
                            : dealWithUrgency.urgency === 'due_today'
                            ? 'Due today'
                            : `${dealWithUrgency.follow_up_days - dealWithUrgency.days_since_contact}d remaining`}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleArchive(deal.id, !deal.archived)}
                          className="p-1.5 text-ink-200 hover:text-ink-400 hover:bg-surface-100 rounded-lg transition-colors"
                          title={deal.archived ? 'Restore' : 'Archive'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/deal/${deal.id}`}
                          className="p-1.5 text-ink-200 hover:text-ink-400 hover:bg-surface-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayedDeals.length === 0 && (
          <div className="text-center py-8">
            <p className="text-ink-200">
              {showArchived ? 'No archived deals' : 'No active deals'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
