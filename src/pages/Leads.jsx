import React, { useState } from 'react';
import { useLeads, updateLead, deleteLead } from '../lib/database';
import {
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  Calendar,
  Building2,
  Trash2,
  AlertCircle,
  Users
} from 'lucide-react';

const statusConfig = {
  new: { label: 'Nouveau', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  contacted: { label: 'Contacté', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  qualified: { label: 'Qualifié', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  visited: { label: 'Visite effectuée', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  lost: { label: 'Perdu', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
};

const sourceLabels = {
  seloger: 'SeLoger',
  leboncoin: 'LeBonCoin',
  facebook: 'Facebook',
  instagram: 'Instagram',
  airbnb: 'Airbnb',
  website: 'Site web',
  referral: 'Recommandation',
  other: 'Autre',
};

function Leads() {
  const { leads, loading, error, refetch } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [updating, setUpdating] = useState(null);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery ||
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdating(leadId);
    const { error } = await updateLead(leadId, { status: newStatus });
    if (error) {
      alert('Erreur: ' + error);
    } else {
      refetch();
    }
    setUpdating(null);
    setActiveMenu(null);
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lead ?')) return;
    
    const { error } = await deleteLead(leadId);
    if (error) {
      alert('Erreur: ' + error);
    } else {
      refetch();
    }
    setActiveMenu(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des leads...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
          Leads
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          {leads.length} contact{leads.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          marginBottom: '24px',
          color: 'var(--error)',
        }}>
          <AlertCircle size={20} />
          <span>Erreur: {error}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = leads.filter(l => l.status === status).length;
          return (
            <div
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              style={{
                padding: '16px',
                background: statusFilter === status ? config.bg : 'var(--bg-card)',
                border: `1px solid ${statusFilter === status ? config.color : 'var(--border-color)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: config.color,
                marginBottom: '4px',
              }}>{count}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(statusConfig).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div style={{
          padding: '60px 40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Users size={36} style={{ color: '#22c55e' }} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
            {leads.length === 0 ? 'Aucun lead' : 'Aucun résultat'}
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            {leads.length === 0 
              ? 'Les leads de vos annonces apparaîtront ici.'
              : 'Essayez de modifier vos filtres de recherche.'}
          </p>
        </div>
      )}

      {/* Leads List */}
      {filteredLeads.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Contact</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Bien</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Source</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Statut</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: statusConfig[lead.status]?.bg || 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '16px',
                        color: statusConfig[lead.status]?.color || 'var(--text-muted)',
                      }}>
                        {(lead.name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', marginBottom: '4px' }}>{lead.name || 'Inconnu'}</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                            }}>
                              <Mail size={12} /> {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                            }}>
                              <Phone size={12} /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {lead.listing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {lead.listing.title || 'Annonce'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {sourceLabels[lead.source] || lead.source || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', position: 'relative' }}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === `status-${lead.id}` ? null : `status-${lead.id}`)}
                      disabled={updating === lead.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: statusConfig[lead.status]?.bg,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        opacity: updating === lead.id ? 0.5 : 1,
                      }}
                    >
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: statusConfig[lead.status]?.color,
                      }}>
                        {statusConfig[lead.status]?.label}
                      </span>
                      <ChevronDown size={14} style={{ color: statusConfig[lead.status]?.color }} />
                    </button>
                    
                    {activeMenu === `status-${lead.id}` && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '20px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '8px',
                        minWidth: '160px',
                        zIndex: 10,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      }}>
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(lead.id, status)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              width: '100%',
                              padding: '10px 12px',
                              background: lead.status === status ? config.bg : 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: config.color,
                            }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                              {config.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      {formatDate(lead.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {lead.message && (
                        <button
                          title={lead.message}
                          style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          <MessageSquare size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(lead.id)}
                        style={{
                          width: '36px',
                          height: '36px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--error)',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          onClick={() => setActiveMenu(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}

export default Leads;
