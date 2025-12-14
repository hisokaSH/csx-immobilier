import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Mail,
  MessageSquare,
  Clock,
  Play,
  Pause,
  Plus,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
  Zap,
  Users,
  Send,
  Calendar,
  Loader2
} from 'lucide-react';

const defaultSequences = [
  {
    id: 'welcome',
    name: 'Bienvenue',
    description: 'Séquence d\'accueil pour les nouveaux leads',
    trigger: 'new_lead',
    active: true,
    steps: [
      { delay: 0, type: 'email', subject: 'Bienvenue chez CSX Immobilier', template: 'welcome' },
      { delay: 1, type: 'email', subject: 'Avez-vous des questions ?', template: 'followup_1' },
      { delay: 3, type: 'sms', message: 'Bonjour, avez-vous eu le temps de consulter nos biens ?' },
      { delay: 7, type: 'email', subject: 'Nouvelles propriétés qui pourraient vous plaire', template: 'recommendations' },
    ]
  },
  {
    id: 'viewing_reminder',
    name: 'Rappel visite',
    description: 'Rappels avant et après une visite',
    trigger: 'visit_scheduled',
    active: true,
    steps: [
      { delay: -1, type: 'sms', message: 'Rappel: Votre visite est prévue demain à {heure}. À bientôt !' },
      { delay: 0, type: 'email', subject: 'Votre visite aujourd\'hui', template: 'visit_day' },
      { delay: 1, type: 'email', subject: 'Comment s\'est passée la visite ?', template: 'post_visit' },
    ]
  },
  {
    id: 'inactive_lead',
    name: 'Réactivation',
    description: 'Réengager les leads inactifs',
    trigger: 'inactive_7_days',
    active: false,
    steps: [
      { delay: 0, type: 'email', subject: 'Vous nous manquez !', template: 'reactivation' },
      { delay: 3, type: 'sms', message: 'Toujours à la recherche d\'un bien ? Nous avons de nouvelles opportunités.' },
      { delay: 7, type: 'email', subject: 'Dernière chance: Offre spéciale', template: 'last_chance' },
    ]
  },
];

const triggers = [
  { value: 'new_lead', label: 'Nouveau lead' },
  { value: 'visit_scheduled', label: 'Visite planifiée' },
  { value: 'inactive_7_days', label: 'Inactif 7 jours' },
  { value: 'inactive_30_days', label: 'Inactif 30 jours' },
  { value: 'property_viewed', label: 'Propriété consultée' },
  { value: 'manual', label: 'Déclenchement manuel' },
];

function LeadFollowup() {
  const [sequences, setSequences] = useState(defaultSequences);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({
    emailsSent: 1247,
    smsSent: 423,
    openRate: 42.5,
    responseRate: 18.3,
  });

  const toggleSequence = (id) => {
    setSequences(prev => prev.map(seq => 
      seq.id === id ? { ...seq, active: !seq.active } : seq
    ));
  };

  const formatDelay = (days) => {
    if (days < 0) return `${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''} avant`;
    if (days === 0) return 'Immédiatement';
    return `J+${days}`;
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Suivi automatique</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Automatisez vos séquences email et SMS
              </p>
            </div>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'var(--gold)',
            border: 'none',
            borderRadius: '10px',
            color: 'var(--bg-primary)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}>
            <Plus size={18} />
            Nouvelle séquence
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Emails envoyés', value: stats.emailsSent.toLocaleString(), icon: Mail, color: '#3b82f6' },
          { label: 'SMS envoyés', value: stats.smsSent.toLocaleString(), icon: MessageSquare, color: '#22c55e' },
          { label: 'Taux d\'ouverture', value: `${stats.openRate}%`, icon: Users, color: 'var(--gold)' },
          { label: 'Taux de réponse', value: `${stats.responseRate}%`, icon: Send, color: '#8b5cf6' },
        ].map((stat, idx) => (
          <div key={idx} style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `${stat.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sequences List */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Séquences actives</h3>
        </div>

        {sequences.map((sequence, idx) => (
          <div
            key={sequence.id}
            style={{
              padding: '20px 24px',
              borderBottom: idx < sequences.length - 1 ? '1px solid var(--border-color)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {/* Toggle */}
            <button
              onClick={() => toggleSequence(sequence.id)}
              style={{
                width: '48px',
                height: '28px',
                background: sequence.active ? 'var(--gold)' : 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: '14px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: sequence.active ? '23px' : '3px',
                transition: 'left 0.2s',
              }} />
            </button>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{sequence.name}</h4>
                <span style={{
                  padding: '4px 10px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}>
                  {triggers.find(t => t.value === sequence.trigger)?.label}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {sequence.description}
              </p>
            </div>

            {/* Steps Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {sequence.steps.slice(0, 4).map((step, stepIdx) => (
                <div
                  key={stepIdx}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: step.type === 'email' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={`${formatDelay(step.delay)} - ${step.type === 'email' ? 'Email' : 'SMS'}`}
                >
                  {step.type === 'email' ? (
                    <Mail size={14} style={{ color: '#3b82f6' }} />
                  ) : (
                    <MessageSquare size={14} style={{ color: '#22c55e' }} />
                  )}
                </div>
              ))}
              {sequence.steps.length > 4 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  +{sequence.steps.length - 4}
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedSequence(sequence)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Edit2 size={14} />
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sequence Editor Modal */}
      {selectedSequence && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setSelectedSequence(null)}>
          <div
            style={{
              width: '700px',
              maxHeight: '80vh',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedSequence.name}</h3>
              <button
                onClick={() => setSelectedSequence(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >×</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
              {/* Timeline */}
              <div style={{ position: 'relative' }}>
                {selectedSequence.steps.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: idx < selectedSequence.steps.length - 1 ? '24px' : 0,
                  }}>
                    {/* Timeline line */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '40px',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: step.type === 'email' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {step.type === 'email' ? (
                          <Mail size={18} style={{ color: '#3b82f6' }} />
                        ) : (
                          <MessageSquare size={18} style={{ color: '#22c55e' }} />
                        )}
                      </div>
                      {idx < selectedSequence.steps.length - 1 && (
                        <div style={{
                          width: '2px',
                          flex: 1,
                          background: 'var(--border-color)',
                          marginTop: '8px',
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{
                      flex: 1,
                      padding: '16px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}>
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {formatDelay(step.delay)}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: step.type === 'email' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                          color: step.type === 'email' ? '#3b82f6' : '#22c55e',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}>
                          {step.type === 'email' ? 'EMAIL' : 'SMS'}
                        </span>
                      </div>
                      {step.type === 'email' ? (
                        <p style={{ fontWeight: '500' }}>{step.subject}</p>
                      ) : (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step */}
              <button style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '16px',
                background: 'var(--bg-tertiary)',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '24px',
              }}>
                <Plus size={18} />
                Ajouter une étape
              </button>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button
                onClick={() => setSelectedSequence(null)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button style={{
                padding: '10px 20px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--bg-primary)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadFollowup;
