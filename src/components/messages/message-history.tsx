'use client';

import { useState } from 'react';
import { Message, Channel, Tone } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { copyToClipboard } from '@/lib/utils';
import { format } from 'date-fns';
import { History, Copy, Check, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MessageHistoryProps {
  messages: Message[];
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (id: string, content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const channelIcons = {
    email: Mail,
    whatsapp: MessageCircle,
  };

  const toneColors = {
    friendly: 'success',
    neutral: 'default',
    firm: 'warning',
  } as const;

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-ink-300" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-surface-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6 text-ink-200" />
            </div>
            <p className="text-sm text-ink-200">No messages generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-ink-300" />
          Message History
          <span className="text-sm font-normal text-ink-200">
            ({messages.length})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-surface-100">
          {messages.map((message) => {
            const ChannelIcon = channelIcons[message.channel];
            const isExpanded = expanded === message.id;

            return (
              <div key={message.id} className="p-4">
                {/* Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : message.id)}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-surface-50 rounded-lg">
                      <ChannelIcon className="w-4 h-4 text-ink-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-500 capitalize">
                          {message.channel}
                        </span>
                        <Badge variant={toneColors[message.tone]} className="capitalize">
                          {message.tone}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-200">
                        {format(new Date(message.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-ink-200 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-200 flex-shrink-0" />
                  )}
                </button>

                {/* Content */}
                {isExpanded && (
                  <div className="mt-3 animate-in slide-up">
                    <div className="p-3 bg-surface-50 rounded-lg mb-3">
                      <p className="text-sm text-ink-400 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.id, message.content)}
                    >
                      {copied === message.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
