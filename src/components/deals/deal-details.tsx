'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Deal, STAGE_CONFIG, DealStage, getStagesForClientType, ClientType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea } from '@/components/ui';
import { Badge } from '@/components/ui';
import { calculateUrgency } from '@/lib/urgency';
import { format, formatDistanceToNow } from 'date-fns';
import { User, MapPin, Clock, Edit2, Save, X, Mail, Phone, Trash2, Archive } from 'lucide-react';

interface DealDetailsProps {
  deal: Deal;
}

export function DealDetails({ deal }: DealDetailsProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState(deal);
  const router = useRouter();
  const supabase = createClient();

  const dealWithUrgency = calculateUrgency(deal);
  const stageConfig = STAGE_CONFIG[deal.deal_stage];

  const urgencyColors = {
    overdue: 'danger',
    due_today: 'warning',
    upcoming: 'success',
  } as const;

  const urgencyText = {
    overdue: `${dealWithUrgency.days_since_contact - dealWithUrgency.follow_up_days} days overdue`,
    due_today: 'Follow-up due today',
    upcoming: `${dealWithUrgency.follow_up_days - dealWithUrgency.days_since_contact} days until follow-up`,
  };

  const stageOptions = getStagesForClientType(formData.client_type as ClientType).map((stage) => ({
    value: stage,
    label: STAGE_CONFIG[stage].label,
  }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          property_address: formData.property_address,
          deal_stage: formData.deal_stage,
          missing_item: formData.missing_item,
          next_step: formData.next_step,
          notes: formData.notes,
        })
        .eq('id', deal.id);

      if (error) throw error;
      setEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Error updating deal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContacted = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', deal.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error('Error updating contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({ archived: !deal.archived })
        .eq('id', deal.id);

      if (error) throw error;
      router.push('/deals');
      router.refresh();
    } catch (err) {
      console.error('Error archiving deal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', deal.id);

      if (error) throw error;
      router.push('/deals');
      router.refresh();
    } catch (err) {
      console.error('Error deleting deal:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deal Details</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormData(deal);
                setEditing(false);
              }}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={loading}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Badge */}
        {!deal.archived && (
          <Badge variant={urgencyColors[dealWithUrgency.urgency]} className="text-sm">
            {urgencyText[dealWithUrgency.urgency]}
          </Badge>
        )}

        {editing ? (
          /* Edit Mode */
          <div className="space-y-4">
            <Input
              label="Client Name"
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.client_email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, client_email: e.target.value })
                }
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.client_phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, client_phone: e.target.value })
                }
              />
            </div>
            <Input
              label="Property Address"
              value={formData.property_address || ''}
              onChange={(e) =>
                setFormData({ ...formData, property_address: e.target.value })
              }
            />
            <Select
              label="Stage"
              value={formData.deal_stage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deal_stage: e.target.value as DealStage,
                })
              }
              options={stageOptions}
            />
            <Input
              label="Missing Item"
              value={formData.missing_item || ''}
              onChange={(e) =>
                setFormData({ ...formData, missing_item: e.target.value })
              }
            />
            <Input
              label="Next Step"
              value={formData.next_step || ''}
              onChange={(e) =>
                setFormData({ ...formData, next_step: e.target.value })
              }
            />
            <Textarea
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
            />
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            {/* Client Info */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-50 rounded-lg">
                <User className="w-5 h-5 text-ink-300" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-500">{deal.client_name}</h3>
                <p className="text-sm text-ink-200 capitalize">{deal.client_type}</p>
              </div>
            </div>

            {/* Contact Info */}
            {(deal.client_email || deal.client_phone) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {deal.client_email && (
                  <a
                    href={`mailto:${deal.client_email}`}
                    className="flex items-center gap-1.5 text-ink-300 hover:text-brand-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {deal.client_email}
                  </a>
                )}
                {deal.client_phone && (
                  <a
                    href={`tel:${deal.client_phone}`}
                    className="flex items-center gap-1.5 text-ink-300 hover:text-brand-600 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {deal.client_phone}
                  </a>
                )}
              </div>
            )}

            {/* Property */}
            {deal.property_address && (
              <div className="flex items-center gap-2 text-sm text-ink-300">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {deal.property_address}
              </div>
            )}

            {/* Stage */}
            <div className="pt-3 border-t border-surface-100">
              <p className="text-xs text-ink-200 mb-1">Current Stage</p>
              <span className="inline-flex text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                {stageConfig.label}
              </span>
              <p className="text-xs text-ink-200 mt-1">{stageConfig.description}</p>
            </div>

            {/* Last Contact */}
            <div className="pt-3 border-t border-surface-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-200 mb-1">Last Contact</p>
                  <div className="flex items-center gap-1.5 text-sm text-ink-400">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(deal.last_contact_at), {
                      addSuffix: true,
                    })}
                    <span className="text-ink-200">
                      ({format(new Date(deal.last_contact_at), 'MMM d, yyyy')})
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkContacted}
                  loading={loading}
                >
                  Mark Contacted
                </Button>
              </div>
            </div>

            {/* Missing Item */}
            {deal.missing_item && (
              <div className="pt-3 border-t border-surface-100">
                <p className="text-xs text-ink-200 mb-1">Missing Item</p>
                <p className="text-sm text-ink-400">{deal.missing_item}</p>
              </div>
            )}

            {/* Next Step */}
            {deal.next_step && (
              <div className="pt-3 border-t border-surface-100">
                <p className="text-xs text-ink-200 mb-1">Next Step</p>
                <p className="text-sm text-ink-400">{deal.next_step}</p>
              </div>
            )}

            {/* Notes */}
            {deal.notes && (
              <div className="pt-3 border-t border-surface-100">
                <p className="text-xs text-ink-200 mb-1">Notes</p>
                <p className="text-sm text-ink-400 whitespace-pre-wrap">
                  {deal.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleArchive}
                loading={loading}
              >
                <Archive className="w-4 h-4 mr-1" />
                {deal.archived ? 'Restore' : 'Archive'}
              </Button>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-300">Are you sure?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
