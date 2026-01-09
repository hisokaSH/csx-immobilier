import { Deal, DealWithUrgency, STAGE_CONFIG } from '@/types';
import { differenceInDays, startOfDay } from 'date-fns';

export function calculateUrgency(deal: Deal): DealWithUrgency {
  const today = startOfDay(new Date());
  const lastContact = startOfDay(new Date(deal.last_contact_at));
  const daysSinceContact = differenceInDays(today, lastContact);
  const followUpDays = STAGE_CONFIG[deal.deal_stage].followUpDays;

  let urgency: 'overdue' | 'due_today' | 'upcoming';
  
  if (daysSinceContact > followUpDays) {
    urgency = 'overdue';
  } else if (daysSinceContact === followUpDays) {
    urgency = 'due_today';
  } else {
    urgency = 'upcoming';
  }

  return {
    ...deal,
    days_since_contact: daysSinceContact,
    follow_up_days: followUpDays,
    urgency,
  };
}

export function groupDealsByUrgency(deals: Deal[]): {
  overdue: DealWithUrgency[];
  due_today: DealWithUrgency[];
  upcoming: DealWithUrgency[];
} {
  const dealsWithUrgency = deals.map(calculateUrgency);

  return {
    overdue: dealsWithUrgency
      .filter((d) => d.urgency === 'overdue')
      .sort((a, b) => b.days_since_contact - a.days_since_contact),
    due_today: dealsWithUrgency
      .filter((d) => d.urgency === 'due_today')
      .sort((a, b) => a.client_name.localeCompare(b.client_name)),
    upcoming: dealsWithUrgency
      .filter((d) => d.urgency === 'upcoming')
      .sort((a, b) => b.days_since_contact - a.days_since_contact),
  };
}

export function getDaysUntilFollowUp(deal: Deal): number {
  const today = startOfDay(new Date());
  const lastContact = startOfDay(new Date(deal.last_contact_at));
  const daysSinceContact = differenceInDays(today, lastContact);
  const followUpDays = STAGE_CONFIG[deal.deal_stage].followUpDays;
  
  return followUpDays - daysSinceContact;
}
