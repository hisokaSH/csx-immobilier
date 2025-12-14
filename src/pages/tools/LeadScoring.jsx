import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Target,
  TrendingUp,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Star,
  Filter,
  ChevronRight,
  Flame,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';

// Score calculation based on real lead data
const calculateLeadScore = (lead) => {
  let score = 0;
  
  // Has email (+10)
  if (lead.email) score += 10;
  
  // Has phone (+15)
  if (lead.phone) score += 15;
  
  // Has message/notes (+10)
  if (lead.message && lead.message.length > 20) score += 10;
  
  // Recent lead (within 7 days: +30, 30 days: +15)
  const daysSinceCreated = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated <= 7) score += 30;
  else if (daysSinceCreated <= 30) score += 15;
  
  // Budget specified (+15)
  if (lead.budget && lead.budget > 0) score += 15;
  
  // Property type specified (+10)
  if (lead.property_type) score += 10;
  
  // Source bonus
  if (lead.source === 'website') score += 5;
  if (lead.source === 'referral') score += 10;
  
  return Math.min(100, score);
};

const getScoreStatus = (score) => {
  if (score >= 70) return { label: 'Chaud', color: '#ef4444', icon: Flame };
  if (score >= 40) return { label: 'Tiède', color: '#f59e0b', icon: TrendingUp };
  return { label: 'Froid', color: '#3b82f6', icon: Clock };
};

function LeadScoring() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Calculate scores for each lead
      const scoredLeads = (data || []).map(lead => ({
        ...lead,
        score: calculateLeadScore(lead),
      }));

      // Sort by score (highest first)
      scoredLeads.sort((a, b) => b.score - a.score);
      
      setLeads(scoredLeads);
    } catch (err) {
      console.error('Error loading leads:', err);
      setError('Erreur lors du chargement des leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(lead => {
        const status = getScoreStatus(lead.score);
        if (filterStatus === 'hot') return lead.score >= 70;
        if (filterStatus === 'warm') return lead.score >= 40 && lead.score < 70;
        if (filterStatus === 'cold') return lead.score < 40;
        return true;
      });

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.score >= 70).length,
    warm: leads.filter(l => l.score >= 40 && l.score < 70).length,
    cold: leads.filter(l => l.score < 40).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
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
              <Target size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Scoring des leads</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Priorisation automatique de vos contacts
              </p>
            </div>
          </div>
          <button
            onClick={loadLeads}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Leads</p>
          <p style={{ fontSize: '28px', fontWeight: '700' }}>{stats.total}</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '4px' }}>Chauds (70+)</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{stats.hot}</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '4px' }}>Tièdes (40-69)</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.warm}</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '4px' }}>Froids (&lt;40)</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{stats.cold}</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--gold)', marginBottom: '4px' }}>Score moyen</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--gold)' }}>{stats.avgScore}</p>
        </div>
      </div>

      {/* Scoring explanation */}
      <div style={{
        padding: '16px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '10px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Info size={18} style={{ color: '#3b82f6', marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#3b82f6', marginBottom: '4px' }}>
              Comment le score est calculé
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Email (+10) • Téléphone (+15) • Message détaillé (+10) • Lead récent (+15 à +30) • Budget spécifié (+15) • Type de bien (+10) • Source (+5 à +10)
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
      }}>
        {[
          { value: 'all', label: 'Tous' },
          { value: 'hot', label: '🔥 Chauds', color: '#ef4444' },
          { value: 'warm', label: '🌡️ Tièdes', color: '#f59e0b' },
          { value: 'cold', label: '❄️ Froids', color: '#3b82f6' },
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            style={{
              padding: '8px 16px',
              background: filterStatus === filter.value ? (filter.color || 'var(--gold)') : 'var(--bg-tertiary)',
              border: '1px solid ' + (filterStatus === filter.value ? (filter.color || 'var(--gold)') : 'var(--border-color)'),
              borderRadius: '8px',
              color: filterStatus === filter.value ? 'white' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
        }}>
          <Loader2 size={32} style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des leads...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && leads.length === 0 && (
        <div style={{
          padding: '60px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Target size={36} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Aucun lead à scorer
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            Les leads capturés via vos annonces apparaîtront ici avec leur score de priorité.
          </p>
        </div>
      )}

      {/* Leads List */}
      {!loading && filteredLeads.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {filteredLeads.map((lead, idx) => {
            const status = getScoreStatus(lead.score);
            const StatusIcon = status.icon;
            
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                style={{
                  padding: '20px',
                  borderBottom: idx < filteredLeads.length - 1 ? '1px solid var(--border-color)' : 'none',
                  cursor: 'pointer',
                  background: selectedLead?.id === lead.id ? 'var(--bg-tertiary)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Score Circle */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `${status.color}20`,
                    border: `3px solid ${status.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: status.color }}>
                      {lead.score}
                    </span>
                  </div>

                  {/* Lead Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{lead.name || 'Sans nom'}</h3>
                      <span style={{
                        padding: '3px 8px',
                        background: `${status.color}20`,
                        color: status.color,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {lead.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {lead.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time & Arrow */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {formatDate(lead.created_at)}
                    </p>
                    <ChevronRight size={18} style={{ 
                      color: 'var(--text-muted)',
                      transform: selectedLead?.id === lead.id ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s',
                    }} />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedLead?.id === lead.id && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Budget</p>
                        <p style={{ fontSize: '14px', fontWeight: '500' }}>{formatCurrency(lead.budget)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Type recherché</p>
                        <p style={{ fontSize: '14px', fontWeight: '500' }}>{lead.property_type || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Source</p>
                        <p style={{ fontSize: '14px', fontWeight: '500' }}>{lead.source || 'Direct'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Créé le</p>
                        <p style={{ fontSize: '14px', fontWeight: '500' }}>{new Date(lead.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    {lead.message && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Message</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px' }}>
                          {lead.message}
                        </p>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            color: '#22c55e',
                            fontSize: '12px',
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={14} /> Appeler
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '6px',
                            color: '#3b82f6',
                            fontSize: '12px',
                            textDecoration: 'none',
                          }}
                        >
                          <Mail size={14} /> Email
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(37, 211, 102, 0.1)',
                            border: '1px solid rgba(37, 211, 102, 0.2)',
                            borderRadius: '6px',
                            color: '#25d366',
                            fontSize: '12px',
                            textDecoration: 'none',
                          }}
                        >
                          <MessageSquare size={14} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default LeadScoring;
