import React, { useState, useEffect } from 'react';
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
  Info,
  AlertCircle,
  Save,
  X
} from 'lucide-react';

const STORAGE_KEY = 'csx_followup_sequences';

const defaultTemplates = [
  {
    id: 'welcome',
    name: 'Bienvenue',
    description: 'Séquence d\'accueil pour les nouveaux leads',
    trigger: 'new_lead',
    active: false,
    steps: [
      { delay: 0, type: 'email', subject: 'Bienvenue chez CSX Immobilier', content: 'Merci pour votre intérêt...' },
      { delay: 1, type: 'email', subject: 'Avez-vous des questions ?', content: 'Je me permets de revenir vers vous...' },
      { delay: 3, type: 'sms', content: 'Bonjour, avez-vous eu le temps de consulter nos biens ?' },
    ]
  },
  {
    id: 'visit_reminder',
    name: 'Rappel visite',
    description: 'Rappels avant et après une visite',
    trigger: 'visit_scheduled',
    active: false,
    steps: [
      { delay: -1, type: 'sms', content: 'Rappel: Votre visite est prévue demain. À bientôt !' },
      { delay: 1, type: 'email', subject: 'Comment s\'est passée la visite ?', content: 'Suite à notre rencontre...' },
    ]
  },
];

const triggers = [
  { value: 'new_lead', label: 'Nouveau lead' },
  { value: 'visit_scheduled', label: 'Visite planifiée' },
  { value: 'inactive_7_days', label: 'Inactif 7 jours' },
  { value: 'inactive_30_days', label: 'Inactif 30 jours' },
  { value: 'manual', label: 'Déclenchement manuel' },
];

function LeadFollowup() {
  const [sequences, setSequences] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSequence, setEditingSequence] = useState(null);

  // Load sequences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSequences(JSON.parse(saved));
    } else {
      // Initialize with default templates (inactive)
      setSequences(defaultTemplates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
    }
  }, []);

  // Save to localStorage whenever sequences change
  const saveSequences = (newSequences) => {
    setSequences(newSequences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSequences));
  };

  const toggleSequenceActive = (id) => {
    const updated = sequences.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    );
    saveSequences(updated);
  };

  const deleteSequence = (id) => {
    if (confirm('Supprimer cette séquence ?')) {
      const updated = sequences.filter(s => s.id !== id);
      saveSequences(updated);
      if (selectedSequence?.id === id) {
        setSelectedSequence(null);
      }
    }
  };

  const handleSaveSequence = (sequence) => {
    if (editingSequence) {
      const updated = sequences.map(s => 
        s.id === editingSequence.id ? { ...sequence, id: s.id } : s
      );
      saveSequences(updated);
    } else {
      const newSequence = {
        ...sequence,
        id: `seq_${Date.now()}`,
        active: false,
      };
      saveSequences([...sequences, newSequence]);
    }
    setShowEditor(false);
    setEditingSequence(null);
  };

  const activeSequences = sequences.filter(s => s.active);

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
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Relances automatiques</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Créez des séquences de suivi pour vos leads
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditingSequence(null); setShowEditor(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Nouvelle séquence
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <Info size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#3b82f6', marginBottom: '4px' }}>
            Planificateur de séquences
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Créez et organisez vos séquences de relance ici. Pour l'envoi automatique d'emails et SMS, 
            une intégration avec SendGrid (email) ou Twilio (SMS) sera nécessaire.
            Les séquences sont sauvegardées localement.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={16} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Séquences</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700' }}>{sequences.length}</p>
        </div>
        <div style={{
          padding: '20px',
          background: activeSequences.length > 0 ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)',
          border: `1px solid ${activeSequences.length > 0 ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}`,
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Play size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Actives</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: activeSequences.length > 0 ? '#22c55e' : 'inherit' }}>
            {activeSequences.length}
          </p>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Mail size={16} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Étapes email</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700' }}>
            {sequences.reduce((sum, s) => sum + s.steps.filter(st => st.type === 'email').length, 0)}
          </p>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MessageSquare size={16} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Étapes SMS</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700' }}>
            {sequences.reduce((sum, s) => sum + s.steps.filter(st => st.type === 'sms').length, 0)}
          </p>
        </div>
      </div>

      {/* Sequences List */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Mes séquences</h3>
        </div>

        {sequences.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Zap size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              Aucune séquence créée
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Créez votre première séquence de relance automatique
            </p>
            <button
              onClick={() => { setEditingSequence(null); setShowEditor(true); }}
              style={{
                padding: '10px 20px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--bg-primary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Créer une séquence
            </button>
          </div>
        ) : (
          <div>
            {sequences.map((sequence, idx) => (
              <div
                key={sequence.id}
                style={{
                  padding: '20px',
                  borderBottom: idx < sequences.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{sequence.name}</h4>
                      <span style={{
                        padding: '3px 8px',
                        background: sequence.active ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-tertiary)',
                        color: sequence.active ? '#22c55e' : 'var(--text-muted)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>
                        {sequence.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      {sequence.description}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        Déclencheur: {triggers.find(t => t.value === sequence.trigger)?.label}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {sequence.steps.length} étape(s)
                      </span>
                    </div>
                    
                    {/* Steps preview */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {sequence.steps.map((step, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '6px',
                          fontSize: '11px',
                        }}>
                          {step.type === 'email' ? <Mail size={12} style={{ color: '#3b82f6' }} /> : <MessageSquare size={12} style={{ color: '#8b5cf6' }} />}
                          <span>J{step.delay >= 0 ? '+' : ''}{step.delay}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleSequenceActive(sequence.id)}
                      style={{
                        padding: '8px',
                        background: sequence.active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        color: sequence.active ? '#ef4444' : '#22c55e',
                        cursor: 'pointer',
                      }}
                      title={sequence.active ? 'Désactiver' : 'Activer'}
                    >
                      {sequence.active ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => { setEditingSequence(sequence); setShowEditor(true); }}
                      style={{
                        padding: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteSequence(sequence.id)}
                      style={{
                        padding: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <SequenceEditor
          sequence={editingSequence}
          onSave={handleSaveSequence}
          onClose={() => { setShowEditor(false); setEditingSequence(null); }}
        />
      )}
    </div>
  );
}

// Sequence Editor Modal
function SequenceEditor({ sequence, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: sequence?.name || '',
    description: sequence?.description || '',
    trigger: sequence?.trigger || 'new_lead',
    steps: sequence?.steps || [{ delay: 0, type: 'email', subject: '', content: '' }],
  });

  const addStep = () => {
    const lastDelay = formData.steps.length > 0 ? formData.steps[formData.steps.length - 1].delay : 0;
    setFormData({
      ...formData,
      steps: [...formData.steps, { delay: lastDelay + 1, type: 'email', subject: '', content: '' }],
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.steps.length === 0) {
      alert('Veuillez remplir le nom et ajouter au moins une étape');
      return;
    }
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card)',
          zIndex: 1,
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
            {sequence ? 'Modifier la séquence' : 'Nouvelle séquence'}
          </h3>
          <button
            onClick={onClose}
            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Nom de la séquence *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Bienvenue nouveaux leads"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de la séquence..."
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Déclencheur
            </label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            >
              {triggers.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Étapes</label>
              <button
                type="button"
                onClick={addStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.steps.map((step, idx) => (
                <div key={idx} style={{
                  padding: '14px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${step.type === 'email' ? '#3b82f6' : '#8b5cf6'}`,
                }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select
                      value={step.type}
                      onChange={(e) => updateStep(idx, 'type', e.target.value)}
                      style={{
                        padding: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Jour</span>
                      <input
                        type="number"
                        value={step.delay}
                        onChange={(e) => updateStep(idx, 'delay', parseInt(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          padding: '8px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          textAlign: 'center',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }} />
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {step.type === 'email' && (
                    <input
                      type="text"
                      value={step.subject || ''}
                      onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                      placeholder="Objet de l'email"
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                  )}
                  <textarea
                    value={step.content || ''}
                    onChange={(e) => updateStep(idx, 'content', e.target.value)}
                    placeholder={step.type === 'email' ? 'Contenu de l\'email...' : 'Message SMS...'}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--bg-primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Save size={18} />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadFollowup;
