import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe features disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// Price IDs - set these in your .env after creating products in Stripe
export const PRICES = {
  SOLO_MONTHLY: process.env.STRIPE_SOLO_MONTHLY_PRICE_ID || 'price_solo',
  AGENCY_MONTHLY: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID || 'price_agency',
};

// Plan configuration
export const PLANS = {
  trial: {
    name: 'Trial',
    price: 0,
    duration: 7, // days
    features: ['unlimited_deals', 'unlimited_messages', 'email_whatsapp', 'dashboard', 'analytics'],
  },
  solo: {
    name: 'Solo Agent',
    price: 79, // EUR/month
    minSeats: 1,
    maxSeats: 1,
    features: ['unlimited_deals', 'unlimited_messages', 'email_whatsapp', 'dashboard', 'analytics', 'email_reminders'],
  },
  agency: {
    name: 'Agency',
    price: 59, // EUR/agent/month
    minSeats: 5,
    maxSeats: 100,
    features: ['unlimited_deals', 'unlimited_messages', 'email_whatsapp', 'dashboard', 'analytics', 'email_reminders', 'centralized_billing', 'priority_support', 'early_access'],
  },
};
