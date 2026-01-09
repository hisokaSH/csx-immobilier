import { Deal, DealStage, Channel, Tone } from '@/types';
import { formatDistanceToNow } from 'date-fns';

// System prompt - stays fixed for all requests
export const SYSTEM_PROMPT = `You are a senior real estate agent with 15+ years of experience.
You write follow-up messages that are:
- concise, clear, and human (never robotic)
- professional (no slang unless WhatsApp and friendly tone)
- focused on the next concrete step
- polite but assertive when needed

You never use marketing hype.
You never mention being an AI.
You never add emojis in email.
For WhatsApp: at most 1 emoji, only if tone is friendly.

Output ONLY the message text (no titles, no explanations, no quotation marks around the message).`;

// Stage-specific prompt templates
const STAGE_PROMPTS: Record<DealStage, (deal: Deal, channel: Channel, tone: Tone, agentName: string) => string> = {
  new_lead_buyer: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (buyer lead).
Context:
- They contacted us about ${deal.property_address || 'a property'}.
- Goal: confirm interest and propose 2 time slots for a call/visit.
- Last contact: ${formatDistanceToNow(new Date(deal.last_contact_at), { addSuffix: true })}.
Tone: ${tone}.
Include a simple question to move forward.
Sign with: ${agentName}.`,

  new_lead_seller: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (seller lead).
Context:
- They want to sell ${deal.property_address || 'their property'}.
- Goal: propose a valuation/initial meeting and ask 2 key questions (timeline + price expectation).
- Last contact: ${formatDistanceToNow(new Date(deal.last_contact_at), { addSuffix: true })}.
Tone: ${tone}.
Sign with: ${agentName}.`,

  viewing_scheduling: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (buyer).
Context:
- Property: ${deal.property_address || 'the property'}.
- Goal: schedule/confirm a viewing.
- Offer two date/time options and ask them to confirm.
Tone: ${tone}.
Sign with: ${agentName}.`,

  post_viewing: (deal, channel, tone, agentName) => `Write a ${channel} follow-up to ${deal.client_name} after a viewing.
Context:
- Property: ${deal.property_address || 'the property'}.
- Goal: get their feedback and decide next step (second visit / offer / move on).
Ask 3 quick questions: overall feeling, main concern, decision timeline.
Tone: ${tone}.
Sign with: ${agentName}.`,

  offer_preparation: (deal, channel, tone, agentName) => {
    let prompt = `Write a ${channel} message to ${deal.client_name} (buyer) preparing an offer.
Context:
- Property: ${deal.property_address || 'the property'}.
- Goal: request the minimum needed info/docs to submit an offer: ID + proof of funds/financing status + desired closing timeline.`;
    if (deal.deadline) {
      prompt += `\nDeadline: ${new Date(deal.deadline).toLocaleDateString()} - mention it naturally.`;
    }
    prompt += `\nTone: ${tone}.\nSign with: ${agentName}.`;
    return prompt;
  },

  offer_submitted: (deal, channel, tone, agentName) => {
    let prompt = `Write a ${channel} message to ${deal.client_name} (buyer).
Context:
- Offer submitted for ${deal.property_address || 'the property'}.
- Goal: keep them informed and set expectation for response timing.`;
    if (deal.deadline) {
      prompt += `\nDeadline: ${new Date(deal.deadline).toLocaleDateString()} - ask if they want to adjust strategy before then.`;
    }
    prompt += `\nTone: ${tone}.\nSign with: ${agentName}.`;
    return prompt;
  },

  offer_received_seller: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (seller).
Context:
- They received an offer on ${deal.property_address || 'their property'}.
- Goal: nudge them to decide or counter.
Mention we can respond with accept / counter / decline and propose a quick call.
Tone: ${tone}.
Sign with: ${agentName}.`,

  negotiation: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (${deal.client_type}).
Context:
- Property: ${deal.property_address || 'the property'}.
- Negotiation status: ${deal.next_step || 'ongoing negotiation'}.
Goal: propose the next action and ask for confirmation today if possible.
Tone: ${tone}.
Sign with: ${agentName}.`,

  contract_signing_buyer: (deal, channel, tone, agentName) => {
    let prompt = `Write a ${channel} message to ${deal.client_name} (buyer).
Context:
- Contract/signing step for ${deal.property_address || 'the property'}.
- Goal: confirm what is needed to sign and propose a time.`;
    if (deal.missing_item) {
      prompt += `\nMissing item: ${deal.missing_item} - request it clearly.`;
    }
    prompt += `\nTone: ${tone}.\nSign with: ${agentName}.`;
    return prompt;
  },

  contract_signing_seller: (deal, channel, tone, agentName) => {
    let prompt = `Write a ${channel} message to ${deal.client_name} (seller).
Context:
- Contract/signing step for ${deal.property_address || 'the property'}.
- Goal: confirm signing logistics.`;
    if (deal.missing_item) {
      prompt += `\nMissing document: ${deal.missing_item} - request it.`;
    }
    prompt += `\nTone: ${tone}.\nSign with: ${agentName}.`;
    return prompt;
  },

  financing_check: (deal, channel, tone, agentName) => {
    let prompt = `Write a ${channel} follow-up to ${deal.client_name} (buyer) about financing.
Context:
- Property: ${deal.property_address || 'the property'}.
- Goal: check bank progress and unblock delays.
Ask for status + whether the bank needs anything from us.`;
    if (deal.deadline) {
      prompt += `\nDeadline: ${new Date(deal.deadline).toLocaleDateString()} - mention it.`;
    }
    prompt += `\nTone: ${tone}.\nSign with: ${agentName}.`;
    return prompt;
  },

  missing_documents: (deal, channel, tone, agentName) => `Write a ${channel} follow-up to ${deal.client_name}.
Context:
- Property: ${deal.property_address || 'the property'}.
- Missing item: ${deal.missing_item || 'required documents'}.
- Goal: get the missing item and keep deal moving.
Ask for a realistic ETA and offer help.
Tone: ${tone}.
Sign with: ${agentName}.`,

  third_party_followup: (deal, channel, tone, agentName) => `Write a ${channel} message to a third party (notary/lawyer/bank).
Context:
- Deal: ${deal.property_address || 'the property'}.
- We are waiting on: ${deal.missing_item || deal.next_step || 'pending items'}.
- Goal: request update and timeline.
Tone: ${tone} (professional).
Sign with: ${agentName}.`,

  closing_buyer: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (buyer).
Context:
- Closing for ${deal.property_address || 'the property'}.
- Goal: confirm date/time, what to bring, and next steps for keys/handover.
Tone: ${tone}.
Sign with: ${agentName}.`,

  closing_seller: (deal, channel, tone, agentName) => `Write a ${channel} message to ${deal.client_name} (seller).
Context:
- Closing for ${deal.property_address || 'the property'}.
- Goal: confirm date/time, any final documents, and handover logistics.
Tone: ${tone}.
Sign with: ${agentName}.`,
};

export function buildUserPrompt(
  deal: Deal,
  channel: Channel,
  tone: Tone,
  agentName: string
): string {
  const promptBuilder = STAGE_PROMPTS[deal.deal_stage];
  return promptBuilder(deal, channel, tone, agentName);
}

// Quality check for generated messages
export function validateMessage(content: string, channel: Channel): { valid: boolean; reason?: string } {
  const wordCount = content.split(/\s+/).length;
  
  // Word limits
  if (channel === 'whatsapp' && wordCount > 120) {
    return { valid: false, reason: 'WhatsApp message exceeds 120 words' };
  }
  if (channel === 'email' && wordCount > 180) {
    return { valid: false, reason: 'Email message exceeds 180 words' };
  }
  
  // AI mention check
  if (/as an ai|i('m| am) an ai|artificial intelligence/i.test(content)) {
    return { valid: false, reason: 'Message mentions AI' };
  }
  
  // Emoji check for email - use simple test instead of complex unicode ranges
  const hasEmoji = (text: string): number => {
    // Match common emoji patterns
    const emojiPattern = /(?:[\u2700-\u27BF]|(?:\uD83C[\uDDE6-\uDDFF]){2}|[\uD800-\uDBFF][\uDC00-\uDFFF]|\u0023-\u0039\uFE0F?\u20E3|\u3299|\u3297|\u303D|\u3030|\u24C2|\uD83C[\uDD70-\uDD71]|\uD83C[\uDD7E-\uDD7F]|\uD83C\uDD8E|\uD83C[\uDD91-\uDD9A]|\uD83C[\uDDE6-\uDDFF]|[\uD83C[\uDE01-\uDE02]|\uD83C\uDE1A|\uD83C\uDE2F|[\uD83C[\uDE32-\uDE3A]|[\uD83C[\uDE50-\uDE51]|\u203C|\u2049|[\u25AA-\u25AB]|\u25B6|\u25C0|[\u25FB-\u25FE]|\u00A9|\u00AE|\u2122|\u2139|\uD83C\uDC04|[\u2600-\u26FF]|\u2B05|\u2B06|\u2B07|\u2B1B|\u2B1C|\u2B50|\u2B55|\u231A|\u231B|\u2328|\u23CF|[\u23E9-\u23F3]|[\u23F8-\u23FA]|\uD83C\uDCCF|\u2934|\u2935|[\u2190-\u21FF])/g;
    const matches = text.match(emojiPattern);
    return matches ? matches.length : 0;
  };
  
  const emojiCount = hasEmoji(content);
  
  if (channel === 'email' && emojiCount > 0) {
    return { valid: false, reason: 'Email should not contain emojis' };
  }
  
  if (channel === 'whatsapp' && emojiCount > 1) {
    return { valid: false, reason: 'WhatsApp message has too many emojis (max 1)' };
  }
  
  // Marketing fluff check
  const fluffPhrases = [
    'amazing opportunity',
    'act now',
    'don\'t miss out',
    'once in a lifetime',
    'incredible deal',
    'limited time',
    'exclusive offer',
  ];
  
  for (const phrase of fluffPhrases) {
    if (content.toLowerCase().includes(phrase)) {
      return { valid: false, reason: `Message contains marketing fluff: "${phrase}"` };
    }
  }
  
  return { valid: true };
}
