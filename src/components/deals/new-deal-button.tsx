'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { STAGE_CONFIG, ClientType, DealStage, getStagesForClientType } from '@/types';
import { Plus, X } from 'lucide-react';

export function NewDealButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_type: 'buyer' as ClientType,
    property_address: '',
    deal_stage: 'new_lead_buyer' as DealStage,
    missing_item: '',
    next_step: '',
    notes: '',
  });

  const clientTypeOptions = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
  ];

  const stageOptions = getStagesForClientType(formData.client_type).map((stage) => ({
    value: stage,
    label: STAGE_CONFIG[stage].label,
  }));

  const handleClientTypeChange = (type: ClientType) => {
    const defaultStage = type === 'buyer' ? 'new_lead_buyer' : 'new_lead_seller';
    setFormData({ ...formData, client_type: type, deal_stage: defaultStage });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('crm_deals').insert({
        user_id: user.id,
        client_name: formData.client_name,
        client_email: formData.client_email || null,
        client_phone: formData.client_phone || null,
        client_type: formData.client_type,
        property_address: formData.property_address || null,
        deal_stage: formData.deal_stage,
        missing_item: formData.missing_item || null,
        next_step: formData.next_step || null,
        notes: formData.notes || null,
        last_contact_at: new Date().toISOString(),
      });

      if (error) throw error;

      setOpen(false);
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_type: 'buyer',
        property_address: '',
        deal_stage: 'new_lead_buyer',
        missing_item: '',
        next_step: '',
        notes: '',
      });
      router.refresh();
    } catch (err) {
      console.error('Error creating deal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        New Deal
      </Button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink-600/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-strong animate-in slide-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h2 className="text-lg font-semibold text-ink-500">New Deal</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-ink-200 hover:text-ink-400 hover:bg-surface-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Client Name *"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({ ...formData, client_name: e.target.value })
                }
                placeholder="John Smith"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) =>
                    setFormData({ ...formData, client_email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, client_phone: e.target.value })
                  }
                  placeholder="+1 555 123 4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Client Type *"
                  value={formData.client_type}
                  onChange={(e) =>
                    handleClientTypeChange(e.target.value as ClientType)
                  }
                  options={clientTypeOptions}
                />
                <Select
                  label="Stage *"
                  value={formData.deal_stage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deal_stage: e.target.value as DealStage,
                    })
                  }
                  options={stageOptions}
                />
              </div>

              <Input
                label="Property Address"
                value={formData.property_address}
                onChange={(e) =>
                  setFormData({ ...formData, property_address: e.target.value })
                }
                placeholder="123 Main St, City, State"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Missing Item"
                  value={formData.missing_item}
                  onChange={(e) =>
                    setFormData({ ...formData, missing_item: e.target.value })
                  }
                  placeholder="e.g., ID copy"
                  hint="Document or info needed"
                />
                <Input
                  label="Next Step"
                  value={formData.next_step}
                  onChange={(e) =>
                    setFormData({ ...formData, next_step: e.target.value })
                  }
                  placeholder="e.g., Counter at $500k"
                  hint="Current negotiation status"
                />
              </div>

              <Textarea
                label="Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional context..."
                rows={3}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Create Deal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
