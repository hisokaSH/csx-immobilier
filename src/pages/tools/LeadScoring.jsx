import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Filter,
  ChevronRight,
  Flame,
  Clock,
  DollarSign
} from 'lucide-react';

const mockLeads = [
  {
    id: 1,
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    phone: '06 12 34 56 78',
    score: 92,
    status: 'hot',
    budget: 450000,
    timeline: 'immediate',
    interactions: 12,
    lastActivity: '2h ago',
    propertyViews: 8,
    messagesRead: 5,
    visitScheduled: true,
    preApproved: true,
  },
  {
    id: 2,
    name: 'Jean Martin',
    email: 'jean.martin@email.com',
    phone: '06 98 76 54 32',
    score: 78,
    status: 'warm',
    budget: 320000,
    timeline: '1-3 months',
    interactions: 7,
    lastActivity: '1d ago',
    propertyViews: 5,
    messagesRead: 3,
    visitScheduled: true,
    preApproved: false,
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    email: 'sophie.b@email.com',
    phone: '06 55 44 33 22',
    score: 65,
    status: 'warm',
    budget: 280000,
    timeline: '3-6 months',
    interactions: 4,
    lastActivity: '3d ago',
    propertyViews: 3,
    messagesRead: 2,
    visitScheduled: false,
    preApproved: false,
  },
  {
    id: 4,
    name: 'Pierre Leroy',
    email: 'p.leroy@email.com',
    phone: '06 11 22 33 44',
    score: 45,
    status: 'cold',
    budget: 200000,
    timeline: '6+ months',
    interactions: 2,
    lastActivity: '1w ago',
    propertyViews: 1,
    messagesRead: 1,
    visitScheduled: false,
    preApproved: false,
  },
  {
    id: 5,
    name: 'Claire Moreau',
    email: 'claire.m@email.com',
    phone: '06 77 88 99 00',
    score: 85,
    status: 'hot',
    budget: 550000,
    timeline: 'immediate',
    interactions: 9,
    lastActivity: '5h ago',
    propertyViews: 6,
    messagesRead: 4,
    visitScheduled: true,
    preApproved: true,
  },
];

const scoringFactors = [
  { name: 'Budget confirmé', weight: 25, icon: DollarSign },
  { name: 'Pré-approbation bancaire', weight: 20, icon: Target },
  { name: 'Timeline d\'achat', weight: 20, icon: Clock },
  { name: 'Engagement (visites)', weight: 15, icon: Eye },
  { name: 'Réactivité messages', weight: 10, icon: MessageSquare },
  { name: 'Visite planifiée', weight: 10, icon: Calendar },
];

function LeadScoring() {
  const [leads, setLeads] = useState(mockLeads);
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return 'var(--gold)';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getStatusBadge = (status) => {
    const configs = {
      hot: { label: '🔥 Chaud', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
      warm: { label: '☀️ Tiède', bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' },
      cold: { label: '❄️ Froid', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    };
    return configs[status] || configs.cold;
  };

  const formatBudget = (budget) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(l => l.status === filter);

  const stats = {
    hot: leads.filter(l => l.status === 'hot').length,
    warm: leads.filter(l => l.status === 'warm').length,
    cold: leads.filter(l => l.status === 'cold').length,
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length),
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Target size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Lead Scoring IA</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Priorisez vos prospects par probabilité d'achat
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { label: 'Leads chauds', value: stats.hot, icon: Flame, color: '#ef4444' },
          { label: 'Leads tièdes', value: stats.warm, icon: TrendingUp, color: '#f97316' },
          { label: 'Leads froids', value: stats.cold, icon: TrendingDown, color: '#3b82f6' },
          { label: 'Score moyen', value: stats.avgScore, icon: Star, color: 'var(--gold)', suffix: '/100' },
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
                <p style={{ fontSize: '24px', fontWeight: '700' }}>
                  {stat.value}{stat.suffix || ''}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Leads List */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Filters */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
          }}>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'hot', label: '🔥 Chauds' },
              { id: 'warm', label: '☀️ Tièdes' },
              { id: 'cold', label: '❄️ Froids' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '8px 16px',
                  background: filter === f.id ? 'var(--gold)' : 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: '6px',
                  color: filter === f.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div>
            {filteredLeads.sort((a, b) => b.score - a.score).map((lead, idx) => {
              const statusBadge = getStatusBadge(lead.status);
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < filteredLeads.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    background: selectedLead?.id === lead.id ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                  }}
                >
                  {/* Score Circle */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(lead.score)} ${lead.score}%, var(--border-color) 0%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px',
                      color: getScoreColor(lead.score),
                    }}>
                      {lead.score}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{lead.name}</h4>
                      <span style={{
                        padding: '3px 8px',
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>Budget: {formatBudget(lead.budget)}</span>
                      <span>•</span>
                      <span>{lead.interactions} interactions</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dernière activité</p>
                    <p style={{ fontSize: '13px', fontWeight: '500' }}>{lead.lastActivity}</p>
                  </div>

                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selected Lead Detail */}
          {selectedLead ? (
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `conic-gradient(${getScoreColor(selectedLead.score)} ${selectedLead.score}%, var(--border-color) 0%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                    color: getScoreColor(selectedLead.score),
                  }}>
                    {selectedLead.score}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedLead.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Score: {selectedLead.score}/100
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <a href={`mailto:${selectedLead.email}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}>
                  <Mail size={14} /> {selectedLead.email}
                </a>
                <a href={`tel:${selectedLead.phone}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}>
                  <Phone size={14} /> {selectedLead.phone}
                </a>
              </div>

              {/* Score Breakdown */}
              <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-muted)' }}>
                FACTEURS DE SCORING
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Budget confirmé', value: formatBudget(selectedLead.budget), positive: true },
                  { label: 'Pré-approbation', value: selectedLead.preApproved ? 'Oui' : 'Non', positive: selectedLead.preApproved },
                  { label: 'Timeline', value: selectedLead.timeline, positive: selectedLead.timeline === 'immediate' },
                  { label: 'Propriétés vues', value: selectedLead.propertyViews, positive: selectedLead.propertyViews >= 5 },
                  { label: 'Visite planifiée', value: selectedLead.visitScheduled ? 'Oui' : 'Non', positive: selectedLead.visitScheduled },
                ].map((factor, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: factor.positive ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{factor.label}</span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: factor.positive ? '#22c55e' : 'var(--text-primary)',
                    }}>
                      {factor.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--bg-primary)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}>
                  Contacter
                </button>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}>
                  Voir le profil
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '40px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <User size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Sélectionnez un lead pour voir les détails</p>
            </div>
          )}

          {/* Scoring Factors */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
              Facteurs de scoring
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {scoringFactors.map((factor, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <factor.icon size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {factor.name}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gold)' }}>
                    {factor.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadScoring;
