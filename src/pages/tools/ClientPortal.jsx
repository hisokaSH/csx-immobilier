import React, { useState } from 'react';
import {
  Users,
  Eye,
  Heart,
  FileText,
  Calendar,
  MessageSquare,
  Send,
  Copy,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle,
  Link2
} from 'lucide-react';

const mockClients = [
  {
    id: 1,
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    phone: '06 12 34 56 78',
    portalActive: true,
    lastLogin: '2024-01-15 14:30',
    savedProperties: 5,
    viewedProperties: 12,
    scheduledVisits: 2,
    documents: 3,
    status: 'active',
  },
  {
    id: 2,
    name: 'Jean Martin',
    email: 'jean.martin@email.com',
    phone: '06 98 76 54 32',
    portalActive: true,
    lastLogin: '2024-01-14 10:15',
    savedProperties: 3,
    viewedProperties: 8,
    scheduledVisits: 1,
    documents: 1,
    status: 'active',
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    email: 'sophie.b@email.com',
    phone: '06 55 44 33 22',
    portalActive: false,
    lastLogin: null,
    savedProperties: 0,
    viewedProperties: 0,
    scheduledVisits: 0,
    documents: 0,
    status: 'pending',
  },
];

function ClientPortal() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyPortalLink = (clientId) => {
    const link = `${window.location.origin}/portal/${clientId}`;
    navigator.clipboard.writeText(link);
    alert('Lien copié !');
  };

  const sendInvite = () => {
    if (!inviteEmail) return;
    alert(`Invitation envoyée à ${inviteEmail}`);
    setShowInviteModal(false);
    setInviteEmail('');
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
              <Users size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Portail Client</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Gérez l'accès de vos clients à leur espace personnel
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
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
            }}
          >
            <Plus size={18} />
            Inviter un client
          </button>
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
          { label: 'Clients actifs', value: clients.filter(c => c.portalActive).length, icon: Users, color: '#22c55e' },
          { label: 'Invitations en attente', value: clients.filter(c => !c.portalActive).length, icon: Clock, color: '#f97316' },
          { label: 'Propriétés sauvegardées', value: clients.reduce((sum, c) => sum + c.savedProperties, 0), icon: Heart, color: '#ef4444' },
          { label: 'Visites planifiées', value: clients.reduce((sum, c) => sum + c.scheduledVisits, 0), icon: Calendar, color: 'var(--gold)' },
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

      {/* Search */}
      <div style={{
        display: 'flex',
        gap: '12px',
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
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 44px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statut</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Favoris</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visites</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Documents</th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dernière connexion</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, idx) => (
              <tr key={client.id} style={{ borderBottom: idx < filteredClients.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--bg-primary)',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}>
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{client.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: client.portalActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                    color: client.portalActive ? '#22c55e' : '#f97316',
                  }}>
                    {client.portalActive ? 'Actif' : 'En attente'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Heart size={14} style={{ color: '#ef4444' }} />
                    <span style={{ fontWeight: '600' }}>{client.savedProperties}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Calendar size={14} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontWeight: '600' }}>{client.scheduledVisits}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FileText size={14} style={{ color: '#3b82f6' }} />
                    <span style={{ fontWeight: '600' }}>{client.documents}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {client.lastLogin || '-'}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => copyPortalLink(client.id)}
                      title="Copier le lien"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Link2 size={14} />
                    </button>
                    <button
                      title="Envoyer un message"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Portal Features Info */}
      <div style={{
        marginTop: '24px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Fonctionnalités du portail client
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { icon: Heart, label: 'Sauvegarder des favoris', desc: 'Vos clients peuvent sauvegarder les biens qui les intéressent' },
            { icon: Calendar, label: 'Planifier des visites', desc: 'Réservation directe de créneaux disponibles' },
            { icon: FileText, label: 'Accès aux documents', desc: 'Mandats, diagnostics, plans accessibles 24/7' },
            { icon: Eye, label: 'Historique de visites', desc: 'Retrouver tous les biens visités avec notes' },
          ].map((feature, idx) => (
            <div key={idx} style={{
              padding: '16px',
              background: 'var(--bg-card)',
              borderRadius: '10px',
            }}>
              <feature.icon size={20} style={{ color: 'var(--gold)', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{feature.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowInviteModal(false)}>
          <div
            style={{
              width: '450px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Inviter un client</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Email du client
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="client@email.com"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Le client recevra un email avec un lien pour créer son compte et accéder à son espace personnel.
              </p>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowInviteModal(false)}
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
              <button
                onClick={sendInvite}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--bg-primary)',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Send size={16} />
                Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPortal;
