import Link from 'next/link';
import { DealWithUrgency, STAGE_CONFIG } from '@/types';
import { Badge } from '@/components/ui';
import { User, MapPin, Clock, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DealCardProps {
  deal: DealWithUrgency;
}

export function DealCard({ deal }: DealCardProps) {
  const stageConfig = STAGE_CONFIG[deal.deal_stage];

  const urgencyColors = {
    overdue: 'danger',
    due_today: 'warning',
    upcoming: 'success',
  } as const;

  return (
    <Link
      href={`/deal/${deal.id}`}
      className="block p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-soft transition-all group relative"
    >
      {/* Quick action hint */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="flex items-center gap-1 text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3" />
          Generate
        </span>
      </div>

      {/* Client Name & Type */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-surface-50 rounded-lg group-hover:bg-brand-50 transition-colors">
            <User className="w-4 h-4 text-ink-300 group-hover:text-brand-600 transition-colors" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-ink-500 truncate">
              {deal.client_name}
            </h3>
            <p className="text-xs text-ink-200 capitalize">{deal.client_type}</p>
          </div>
        </div>
        <Badge variant={urgencyColors[deal.urgency]} className="flex-shrink-0">
          {deal.urgency === 'overdue'
            ? `${deal.days_since_contact - deal.follow_up_days}d late`
            : deal.urgency === 'due_today'
            ? 'Today'
            : `${deal.follow_up_days - deal.days_since_contact}d left`}
        </Badge>
      </div>

      {/* Property */}
      {deal.property_address && (
        <div className="flex items-center gap-1.5 text-sm text-ink-200 mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{deal.property_address}</span>
        </div>
      )}

      {/* Stage & Last Contact */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-100">
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
          {stageConfig.label}
        </span>
        <div className="flex items-center gap-1 text-xs text-ink-100">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(deal.last_contact_at), { addSuffix: true })}
        </div>
      </div>
    </Link>
  );
}
