import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend, FROM_EMAIL } from '@/lib/email';
import { differenceInDays } from 'date-fns';

// Use service role for cron jobs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stage to follow-up days mapping
const FOLLOW_UP_DAYS: Record<string, number> = {
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

interface Deal {
  id: string;
  client_name: string;
  property_address: string | null;
  deal_stage: string;
  last_contact_at: string;
}

interface UserWithDeals {
  id: string;
  email: string;
  full_name: string;
  deals: Deal[];
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!resend) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
  }

  try {
    // Get all users with active subscription or active trial
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, trial_ends_at, subscription_status')
      .or('subscription_status.eq.active,subscription_status.eq.trial');

    if (usersError || !users) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const now = new Date();
    let emailsSent = 0;

    for (const user of users) {
      // Skip if trial has expired
      if (user.subscription_status === 'trial' && user.trial_ends_at) {
        if (new Date(user.trial_ends_at) < now) {
          continue;
        }
      }

      // Fetch user's active deals
      const { data: deals, error: dealsError } = await supabase
        .from('crm_deals')
        .select('id, client_name, property_address, deal_stage, last_contact_at')
        .eq('user_id', user.id)
        .eq('archived', false);

      if (dealsError || !deals || deals.length === 0) continue;

      // Find overdue and due today deals
      const overdueDeals: Deal[] = [];
      const dueTodayDeals: Deal[] = [];

      for (const deal of deals) {
        const lastContact = new Date(deal.last_contact_at);
        const daysSince = differenceInDays(now, lastContact);
        const followUpDays = FOLLOW_UP_DAYS[deal.deal_stage] || 2;

        if (daysSince > followUpDays) {
          overdueDeals.push(deal);
        } else if (daysSince === followUpDays) {
          dueTodayDeals.push(deal);
        }
      }

      // Skip if no action needed
      if (overdueDeals.length === 0 && dueTodayDeals.length === 0) continue;

      // Send email
      const firstName = user.full_name?.split(' ')[0] || 'there';
      const totalTasks = overdueDeals.length + dueTodayDeals.length;

      const emailHtml = generateEmailHtml({
        firstName,
        overdueDeals,
        dueTodayDeals,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      });

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: `📋 ${totalTasks} follow-up${totalTasks === 1 ? '' : 's'} need your attention`,
          html: emailHtml,
        });
        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}

function generateEmailHtml({ 
  firstName, 
  overdueDeals, 
  dueTodayDeals, 
  appUrl 
}: { 
  firstName: string;
  overdueDeals: Deal[];
  dueTodayDeals: Deal[];
  appUrl: string;
}) {
  const dealRow = (deal: Deal, isOverdue: boolean) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
        <strong style="color: #1a1a1a;">${deal.client_name}</strong>
        ${deal.property_address ? `<br><span style="color: #666; font-size: 14px;">${deal.property_address}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <span style="
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          ${isOverdue 
            ? 'background-color: #fee2e2; color: #dc2626;' 
            : 'background-color: #fef3c7; color: #d97706;'
          }
        ">
          ${isOverdue ? 'Overdue' : 'Due Today'}
        </span>
      </td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background-color: #006dc4; padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
              Your Daily Follow-ups
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.5;">
              Hi ${firstName},
            </p>
            <p style="margin: 0 0 24px; color: #333; font-size: 16px; line-height: 1.5;">
              You have <strong>${overdueDeals.length + dueTodayDeals.length} deals</strong> that need follow-up today.
            </p>

            <!-- Deals Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tbody>
                ${overdueDeals.map(d => dealRow(d, true)).join('')}
                ${dueTodayDeals.map(d => dealRow(d, false)).join('')}
              </tbody>
            </table>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="${appUrl}/app" style="
                display: inline-block;
                padding: 14px 32px;
                background-color: #006dc4;
                color: white;
                text-decoration: none;
                font-weight: 600;
                border-radius: 8px;
                font-size: 16px;
              ">
                View All Follow-ups
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
              Real Estate CRM • AI-Powered Follow-ups
            </p>
            <p style="margin: 8px 0 0; color: #999; font-size: 12px; text-align: center;">
              You're receiving this because you have email reminders enabled.
              <a href="${appUrl}/settings" style="color: #006dc4;">Manage preferences</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
