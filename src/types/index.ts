// Database types
export type DealStage =
  | 'new_lead_buyer'
  | 'new_lead_seller'
  | 'viewing_scheduling'
  | 'post_viewing'
  | 'offer_preparation'
  | 'offer_submitted'
  | 'offer_received_seller'
  | 'negotiation'
  | 'contract_signing_buyer'
  | 'contract_signing_seller'
  | 'financing_check'
  | 'missing_documents'
  | 'third_party_followup'
  | 'closing_buyer'
  | 'closing_seller';

export type ClientType = 'buyer' | 'seller';
export type Channel = 'email' | 'whatsapp';
export type Tone = 'friendly' | 'neutral' | 'firm';
export type UserRole = 'agent' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  trial_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_type: ClientType;
  property_address: string | null;
  deal_stage: DealStage;
  last_contact_at: string;
  missing_item: string | null;
  next_step: string | null;
  deadline: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  deal_id: string;
  user_id: string;
  channel: Channel;
  tone: Tone;
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  deal_id: string;
  user_id: string;
  due_at: string;
  title: string;
  status: 'pending' | 'completed' | 'dismissed';
  created_at: string;
}

// API types
export interface GenerateMessageRequest {
  deal_id: string;
  channel: Channel;
  tone: Tone;
}

export interface GenerateMessageResponse {
  content: string;
  tokens_used: number;
  message_id: string;
}

// UI types
export interface DealWithUrgency extends Deal {
  days_since_contact: number;
  follow_up_days: number;
  urgency: 'overdue' | 'due_today' | 'upcoming';
}

// Stage configuration
export interface StageConfig {
  label: string;
  followUpDays: number;
  clientType: ClientType | 'both';
  description: string;
}

export const STAGE_CONFIG: Record<DealStage, StageConfig> = {
  new_lead_buyer: {
    label: 'New Lead (Buyer)',
    followUpDays: 1,
    clientType: 'buyer',
    description: 'First contact with buyer lead',
  },
  new_lead_seller: {
    label: 'New Lead (Seller)',
    followUpDays: 1,
    clientType: 'seller',
    description: 'First contact with seller lead',
  },
  viewing_scheduling: {
    label: 'Viewing Scheduling',
    followUpDays: 2,
    clientType: 'buyer',
    description: 'Scheduling property viewing',
  },
  post_viewing: {
    label: 'Post-Viewing',
    followUpDays: 1,
    clientType: 'buyer',
    description: 'Follow-up after viewing',
  },
  offer_preparation: {
    label: 'Offer Preparation',
    followUpDays: 2,
    clientType: 'buyer',
    description: 'Preparing offer documents',
  },
  offer_submitted: {
    label: 'Offer Submitted',
    followUpDays: 3,
    clientType: 'buyer',
    description: 'Waiting for seller response',
  },
  offer_received_seller: {
    label: 'Offer Received',
    followUpDays: 1,
    clientType: 'seller',
    description: 'Seller reviewing offer',
  },
  negotiation: {
    label: 'Negotiation',
    followUpDays: 1,
    clientType: 'both',
    description: 'Active negotiation phase',
  },
  contract_signing_buyer: {
    label: 'Contract Signing (Buyer)',
    followUpDays: 2,
    clientType: 'buyer',
    description: 'Buyer contract signing',
  },
  contract_signing_seller: {
    label: 'Contract Signing (Seller)',
    followUpDays: 2,
    clientType: 'seller',
    description: 'Seller contract signing',
  },
  financing_check: {
    label: 'Financing Check',
    followUpDays: 3,
    clientType: 'buyer',
    description: 'Checking financing status',
  },
  missing_documents: {
    label: 'Missing Documents',
    followUpDays: 2,
    clientType: 'both',
    description: 'Chasing missing documents',
  },
  third_party_followup: {
    label: 'Third Party Follow-up',
    followUpDays: 3,
    clientType: 'both',
    description: 'Following up with notary/lawyer/bank',
  },
  closing_buyer: {
    label: 'Closing (Buyer)',
    followUpDays: 2,
    clientType: 'buyer',
    description: 'Final closing coordination',
  },
  closing_seller: {
    label: 'Closing (Seller)',
    followUpDays: 2,
    clientType: 'seller',
    description: 'Final closing coordination',
  },
};

// Helper to get stages for a client type
export function getStagesForClientType(clientType: ClientType): DealStage[] {
  return (Object.entries(STAGE_CONFIG) as [DealStage, StageConfig][])
    .filter(([, config]) => config.clientType === clientType || config.clientType === 'both')
    .map(([stage]) => stage);
}
