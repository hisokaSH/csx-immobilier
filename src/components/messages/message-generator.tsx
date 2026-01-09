'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Deal, Channel, Tone } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Button, Select } from '@/components/ui';
import { copyToClipboard, createMailtoLink, createWhatsAppLink } from '@/lib/utils';
import { Sparkles, Copy, Mail, MessageCircle, Check, AlertCircle } from 'lucide-react';

interface MessageGeneratorProps {
  deal: Deal;
  agentName: string;
}

export function MessageGenerator({ deal, agentName }: MessageGeneratorProps) {
  const [channel, setChannel] = useState<Channel>('email');
  const [tone, setTone] = useState<Tone>('friendly');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const channelOptions = [
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  const toneOptions = [
    { value: 'friendly', label: 'Friendly' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'firm', label: 'Firm' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: deal.id,
          channel,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate message');
      }

      setMessage(data.content);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!message) return;
    const success = await copyToClipboard(message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenEmail = () => {
    if (!message || !deal.client_email) return;
    const subject = `Re: ${deal.property_address || 'Property Inquiry'}`;
    window.open(createMailtoLink(deal.client_email, subject, message), '_blank');
  };

  const handleOpenWhatsApp = () => {
    if (!message || !deal.client_phone) return;
    window.open(createWhatsAppLink(deal.client_phone, message), '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          Generate Message
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            options={channelOptions}
          />
          <Select
            label="Tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            options={toneOptions}
          />
        </div>

        {/* Generate Button */}
        <Button onClick={handleGenerate} loading={loading} className="w-full">
          <Sparkles className="w-4 h-4" />
          Generate Message
        </Button>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Generated Message */}
        {message && (
          <div className="space-y-3">
            <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
              <p className="text-sm text-ink-500 whitespace-pre-wrap">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>

              {deal.client_email && (
                <Button variant="secondary" size="sm" onClick={handleOpenEmail}>
                  <Mail className="w-4 h-4" />
                  Open in Email
                </Button>
              )}

              {deal.client_phone && (
                <Button variant="secondary" size="sm" onClick={handleOpenWhatsApp}>
                  <MessageCircle className="w-4 h-4" />
                  Open WhatsApp
                </Button>
              )}
            </div>

            <p className="text-xs text-ink-100">
              Message auto-saved to history
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
