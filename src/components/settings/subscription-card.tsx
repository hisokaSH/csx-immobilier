'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { CreditCard, Check, Sparkles, ExternalLink, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface SubscriptionCardProps {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  hasStripeCustomer: boolean;
}

export function SubscriptionCard({ plan, status, currentPeriodEnd, trialEndsAt, hasStripeCustomer }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const isPaid = plan === 'solo' && (status === 'active' || status === 'trialing');
  const isTrial = status === 'trial' || status === 'trialing';
  const trialDaysLeft = trialEndsAt ? Math.max(0, differenceInDays(new Date(trialEndsAt), new Date())) : 7;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'solo' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-ink-300" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPaid && !isTrial ? (
          // Paid Plan Active
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-ink-600">Solo Agent</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-ink-300 mt-1">
                  {currentPeriodEnd && (
                    <>Renews on {format(new Date(currentPeriodEnd), 'MMM d, yyyy')}</>
                  )}
                </p>
              </div>
              <span className="text-2xl font-bold text-ink-600">€79<span className="text-sm font-normal text-ink-300">/mo</span></span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                'Unlimited deals',
                'Unlimited AI messages',
                'Daily email reminders',
                'Priority support',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-ink-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            {hasStripeCustomer && (
              <Button 
                variant="secondary" 
                onClick={handleManageBilling}
                loading={portalLoading}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            )}
          </div>
        ) : (
          // Trial
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-ink-600">Free Trial</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trialDaysLeft} days left
                  </span>
                </div>
                <p className="text-sm text-ink-300 mt-1">
                  Full access to all features
                </p>
              </div>
            </div>

            {/* Upgrade Card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-white mb-1">Subscribe to Solo Agent</h4>
              <p className="text-brand-100 text-sm mb-3">
                Keep access to unlimited deals & AI messages after your trial.
              </p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-white">€79</span>
                <span className="text-brand-200">/month</span>
              </div>
              <Button 
                onClick={handleSubscribe}
                loading={loading}
                className="w-full bg-white text-brand-600 hover:bg-brand-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Subscribe Now
              </Button>
            </div>

            <p className="text-xs text-ink-200 text-center">
              Cancel anytime. No questions asked.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
