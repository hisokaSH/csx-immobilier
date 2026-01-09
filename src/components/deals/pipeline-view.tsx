'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Deal, DealStage, STAGE_CONFIG } from '@/types';
import { User, MapPin, GripVertical, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PipelineViewProps {
  deals: Deal[];
}

// Group stages into pipeline phases
const PIPELINE_STAGES: { phase: string; stages: DealStage[] }[] = [
  {
    phase: 'Leads',
    stages: ['new_lead_buyer', 'new_lead_seller'],
  },
  {
    phase: 'Viewing',
    stages: ['viewing_scheduling', 'post_viewing'],
  },
  {
    phase: 'Offer',
    stages: ['offer_preparation', 'offer_submitted', 'offer_received_seller', 'negotiation'],
  },
  {
    phase: 'Contract',
    stages: ['contract_signing_buyer', 'contract_signing_seller', 'financing_check', 'missing_documents'],
  },
  {
    phase: 'Closing',
    stages: ['third_party_followup', 'closing_buyer', 'closing_seller'],
  },
];

export function PipelineView({ deals }: PipelineViewProps) {
  const [draggingDeal, setDraggingDeal] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggingDeal(dealId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragEnd = () => {
    setDraggingDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, newStage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    
    if (!dealId) return;

    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.deal_stage === newStage) {
      setDraggingDeal(null);
      setDragOverStage(null);
      return;
    }

    // Update in database
    const { error } = await supabase
      .from('crm_deals')
      .update({ deal_stage: newStage })
      .eq('id', dealId);

    if (!error) {
      router.refresh();
    }

    setDraggingDeal(null);
    setDragOverStage(null);
  };

  const getDealsForStage = (stage: DealStage) => {
    return deals.filter(d => d.deal_stage === stage && !d.archived);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map(({ phase, stages }) => (
          <div key={phase} className="flex-shrink-0">
            {/* Phase Header */}
            <div className="mb-3 px-1">
              <h3 className="text-sm font-semibold text-ink-400 uppercase tracking-wide">
                {phase}
              </h3>
            </div>
            
            {/* Stage Columns */}
            <div className="flex gap-3">
              {stages.map(stage => {
                const stageDeals = getDealsForStage(stage);
                const config = STAGE_CONFIG[stage];
                const isDragOver = dragOverStage === stage;

                return (
                  <div
                    key={stage}
                    className={cn(
                      'w-64 bg-surface-50 rounded-xl p-3 min-h-[400px] transition-colors',
                      isDragOver && 'bg-brand-50 ring-2 ring-brand-300'
                    )}
                    onDragOver={(e) => handleDragOver(e, stage)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-ink-400 truncate">
                        {config.label}
                      </span>
                      <span className="text-xs text-ink-200 bg-white px-1.5 py-0.5 rounded">
                        {stageDeals.length}
                      </span>
                    </div>

                    {/* Deal Cards */}
                    <div className="space-y-2">
                      {stageDeals.map(deal => (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            'bg-white rounded-lg border border-surface-200 p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-soft hover:border-surface-300 group',
                            draggingDeal === deal.id && 'opacity-50 rotate-2 shadow-medium'
                          )}
                        >
                          <Link href={`/deal/${deal.id}`} className="block">
                            {/* Drag Handle + Client */}
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-ink-100 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-ink-200 flex-shrink-0" />
                                  <span className="text-sm font-medium text-ink-500 truncate">
                                    {deal.client_name}
                                  </span>
                                </div>
                                <span className="text-xs text-ink-200 capitalize ml-5">
                                  {deal.client_type}
                                </span>
                              </div>
                            </div>

                            {/* Property */}
                            {deal.property_address && (
                              <div className="flex items-center gap-1.5 mt-2 ml-6">
                                <MapPin className="w-3 h-3 text-ink-200 flex-shrink-0" />
                                <span className="text-xs text-ink-300 truncate">
                                  {deal.property_address}
                                </span>
                              </div>
                            )}

                            {/* Last Contact */}
                            <div className="mt-2 ml-6">
                              <span className="text-xs text-ink-100">
                                {formatDistanceToNow(new Date(deal.last_contact_at), { addSuffix: true })}
                              </span>
                            </div>
                          </Link>
                        </div>
                      ))}

                      {/* Empty State */}
                      {stageDeals.length === 0 && (
                        <div className={cn(
                          'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
                          isDragOver ? 'border-brand-300 bg-brand-50' : 'border-surface-200'
                        )}>
                          <p className="text-xs text-ink-200">
                            {isDragOver ? 'Drop here' : 'No deals'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
