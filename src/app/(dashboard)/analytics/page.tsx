import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Deal, STAGE_CONFIG, DealStage } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { 
  BarChart3, Users, Clock, TrendingUp, 
  AlertTriangle, CheckCircle, Briefcase, MessageSquare 
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

export const dynamic = 'force-dynamic';

// Stage to follow-up days mapping
const FOLLOW_UP_DAYS: Record<DealStage, number> = {
  new_lead_buyer: 1,
  new_lead_seller: 1,
  viewing_scheduling: 2,
  post_viewing: 1,
  offer_preparation: 2,
  offer_submitted: 3,
  offer_received_seller: 1,
  negotiation: 1,
  contract_signing_buyer: 2,
  contract_signing_seller: 2,
  financing_check: 3,
  missing_documents: 2,
  third_party_followup: 3,
  closing_buyer: 2,
  closing_seller: 2,
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all deals
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('user_id', user.id);

  // Fetch messages count
  const { count: messagesCount } = await supabase
    .from('crm_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const allDeals = (deals as Deal[]) || [];
  const activeDeals = allDeals.filter(d => !d.archived);
  const archivedDeals = allDeals.filter(d => d.archived);

  // Calculate overdue
  const now = new Date();
  const overdueDeals = activeDeals.filter(deal => {
    const lastContact = new Date(deal.last_contact_at);
    const daysSince = differenceInDays(now, lastContact);
    const followUpDays = FOLLOW_UP_DAYS[deal.deal_stage] || 2;
    return daysSince > followUpDays;
  });

  // Deals by stage
  const dealsByStage = activeDeals.reduce((acc, deal) => {
    acc[deal.deal_stage] = (acc[deal.deal_stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Deals by type
  const buyers = activeDeals.filter(d => d.client_type === 'buyer').length;
  const sellers = activeDeals.filter(d => d.client_type === 'seller').length;

  // Pipeline stages grouped
  const pipelineStats = {
    leads: activeDeals.filter(d => ['new_lead_buyer', 'new_lead_seller'].includes(d.deal_stage)).length,
    viewing: activeDeals.filter(d => ['viewing_scheduling', 'post_viewing'].includes(d.deal_stage)).length,
    offer: activeDeals.filter(d => ['offer_preparation', 'offer_submitted', 'offer_received_seller', 'negotiation'].includes(d.deal_stage)).length,
    contract: activeDeals.filter(d => ['contract_signing_buyer', 'contract_signing_seller', 'financing_check', 'missing_documents'].includes(d.deal_stage)).length,
    closing: activeDeals.filter(d => ['third_party_followup', 'closing_buyer', 'closing_seller'].includes(d.deal_stage)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink-600">Analytics</h1>
        <p className="text-ink-200 mt-1">Overview of your deals and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-300">Active Deals</p>
                <p className="text-3xl font-semibold text-ink-600 mt-1">{activeDeals.length}</p>
              </div>
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-brand-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-300">Overdue Follow-ups</p>
                <p className="text-3xl font-semibold text-ink-600 mt-1">{overdueDeals.length}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${overdueDeals.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <AlertTriangle className={`w-6 h-6 ${overdueDeals.length > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-300">Messages Generated</p>
                <p className="text-3xl font-semibold text-ink-600 mt-1">{messagesCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-300">Archived Deals</p>
                <p className="text-3xl font-semibold text-ink-600 mt-1">{archivedDeals.length}</p>
              </div>
              <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-ink-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ink-300" />
            Pipeline Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Leads', count: pipelineStats.leads, color: 'bg-blue-500' },
              { label: 'Viewing', count: pipelineStats.viewing, color: 'bg-cyan-500' },
              { label: 'Offer', count: pipelineStats.offer, color: 'bg-amber-500' },
              { label: 'Contract', count: pipelineStats.contract, color: 'bg-purple-500' },
              { label: 'Closing', count: pipelineStats.closing, color: 'bg-emerald-500' },
            ].map((stage) => {
              const percentage = activeDeals.length > 0 ? (stage.count / activeDeals.length) * 100 : 0;
              return (
                <div key={stage.label} className="flex items-center gap-4">
                  <span className="text-sm text-ink-400 w-20">{stage.label}</span>
                  <div className="flex-1 h-8 bg-surface-100 rounded-lg overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, stage.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-ink-500 w-8 text-right">{stage.count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client Types & Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-ink-300" />
              Client Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-12 py-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-semibold text-brand-600">{buyers}</span>
                </div>
                <p className="text-sm text-ink-400">Buyers</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-semibold text-emerald-600">{sellers}</span>
                </div>
                <p className="text-sm text-ink-400">Sellers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-ink-300" />
              Deals by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(dealsByStage)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                    <span className="text-sm text-ink-400">{STAGE_CONFIG[stage as DealStage]?.label || stage}</span>
                    <span className="text-sm font-medium text-ink-600">{count}</span>
                  </div>
                ))}
              {Object.keys(dealsByStage).length === 0 && (
                <p className="text-sm text-ink-200 text-center py-4">No active deals yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
