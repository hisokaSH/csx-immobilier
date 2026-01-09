import { type ClassValue, clsx } from 'clsx';

// Simple clsx replacement without tailwind-merge for smaller bundle
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Format phone number for wa.me link
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

// Create mailto link
export function createMailtoLink(
  email: string,
  subject?: string,
  body?: string
): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const queryString = params.toString();
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
}

// Create WhatsApp link
export function createWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const params = new URLSearchParams();
  if (message) params.set('text', message);
  const queryString = params.toString();
  return `https://wa.me/${cleanPhone}${queryString ? `?${queryString}` : ''}`;
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
