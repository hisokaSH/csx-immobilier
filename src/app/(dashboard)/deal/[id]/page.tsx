import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Deal, Message, STAGE_CONFIG } from '@/types';
import { DealDetails } from '@/components/deals/deal-details';
import { MessageGenerator } from '@/components/messages/message-generator';
import { MessageHistory } from '@/components/messages/message-history';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch deal
  const { data: deal, error } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !deal) {
    notFound();
  }

  // Fetch user profile for agent name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch message history
  const { data: messages } = await supabase
    .from('crm_messages')
    .select('*')
    .eq('deal_id', id)
    .order('created_at', { ascending: false });

  const agentName = profile?.full_name || 'Agent';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/deals"
        className="inline-flex items-center gap-1.5 text-sm text-ink-200 hover:text-ink-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Deals
      </Link>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Deal Info */}
        <div className="lg:col-span-2 space-y-6">
          <DealDetails deal={deal as Deal} />
        </div>

        {/* Right Column - Message Generator + History */}
        <div className="lg:col-span-3 space-y-6">
          <MessageGenerator
            deal={deal as Deal}
            agentName={agentName}
          />
          <MessageHistory messages={(messages as Message[]) || []} />
        </div>
      </div>
    </div>
  );
}
