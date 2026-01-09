import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Deal, STAGE_CONFIG } from '@/types';
import { groupDealsByUrgency } from '@/lib/urgency';
import { DealCard } from '@/components/deals/deal-card';
import { AlertCircle, Clock, CalendarCheck, Briefcase, TrendingUp, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch user's active deals
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('last_contact_at', { ascending: true });

  // Fetch profile for greeting
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Get messages count for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: todayMessages } = await supabase
    .from('crm_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString());

  const grouped = groupDealsByUrgency((deals as Deal[]) || []);
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const sections = [
    {
      title: 'Overdue',
      icon: AlertCircle,
      deals: grouped.overdue,
      emptyText: 'No overdue follow-ups',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Due Today',
      icon: Clock,
      deals: grouped.due_today,
      emptyText: 'Nothing due today',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Upcoming',
      icon: CalendarCheck,
      deals: grouped.upcoming,
      emptyText: 'No upcoming follow-ups',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ];

  const totalTasks = grouped.overdue.length + grouped.due_today.length;

  return (
    <div className="space-y-8">
      {/* Header with Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-ink-600">{greeting}, {firstName}</h1>
        <p className="text-ink-200 mt-1">
          {totalTasks > 0 
            ? `You have ${totalTasks} follow-up${totalTasks === 1 ? '' : 's'} that need attention`
            : "You're all caught up! Great work."}
        </p>
      </div>

      {/* Quick Stats */}
      {deals && deals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink-600">{deals.length}</p>
                <p className="text-xs text-ink-300">Active Deals</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${grouped.overdue.length > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <TrendingUp className={`w-5 h-5 ${grouped.overdue.length > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink-600">{grouped.overdue.length}</p>
                <p className="text-xs text-ink-300">Overdue</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink-600">{todayMessages || 0}</p>
                <p className="text-xs text-ink-300">Messages Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${section.bgColor}`}>
                <section.icon className={`w-4 h-4 ${section.color}`} />
              </div>
              <h2 className="font-medium text-ink-500">{section.title}</h2>
              <span className="text-sm text-ink-200">
                ({section.deals.length})
              </span>
            </div>

            {/* Deals Grid */}
            {section.deals.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${section.borderColor} ${section.bgColor}`}>
                <p className={`text-sm ${section.color}`}>{section.emptyText}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!deals?.length && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-8 h-8 text-ink-200" />
          </div>
          <h3 className="text-lg font-medium text-ink-500 mb-1">No deals yet</h3>
          <p className="text-ink-200 mb-4">
            Create your first deal to start tracking follow-ups
          </p>
          <a
            href="/deals"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Go to Deals
          </a>
        </div>
      )}
    </div>
  );
}
