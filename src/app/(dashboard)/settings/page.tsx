import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { SettingsForm } from '@/components/settings/settings-form';
import { SubscriptionCard } from '@/components/settings/subscription-card';
import { User, Shield, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SettingsPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink-600">Settings</h1>
        <p className="text-ink-200 mt-1">Manage your account and preferences</p>
      </div>

      {/* Success/Cancel Messages */}
      {params.success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700">
            🎉 Welcome to Pro! Your subscription is now active.
          </p>
        </div>
      )}
      {params.canceled && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-ink-300" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm 
            initialData={{
              full_name: profile?.full_name || '',
              email: user.email || '',
            }}
          />
        </CardContent>
      </Card>

      {/* Subscription */}
      <SubscriptionCard 
        plan={profile?.subscription_plan || 'trial'}
        status={profile?.subscription_status || (profile?.trial_active ? 'trial' : 'inactive')}
        currentPeriodEnd={profile?.subscription_current_period_end}
        trialEndsAt={profile?.trial_ends_at}
        hasStripeCustomer={!!profile?.stripe_customer_id}
      />

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-ink-300" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-surface-100">
            <div>
              <p className="text-sm font-medium text-ink-500">Email</p>
              <p className="text-sm text-ink-300">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-surface-100">
            <div>
              <p className="text-sm font-medium text-ink-500">Role</p>
              <p className="text-sm text-ink-300 capitalize">{profile?.role || 'agent'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-ink-500">Account Created</p>
              <p className="text-sm text-ink-300">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
