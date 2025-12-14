import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Star,
  Send,
  MessageSquare,
  ExternalLink,
  Copy,
  Mail,
  Calendar,
  Users,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Info,
  Check,
  Loader2
} from 'lucide-react';

const STORAGE_KEY = 'csx_reviews';
const CLIENTS_KEY = 'csx_review_clients';

const platforms = [
  { id: 'google', name: 'Google', color: '#4285f4', icon: '🔍' },
  { id: 'facebook', name: 'Facebook', color: '#1877f2', icon: '📘' },
  { id: 'internal', name: 'Interne', color: 'var(--gold)', icon: '⭐' },
];

function ReviewCollection() {
  const [reviews, setReviews] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [newReview, setNewReview] = useState({ client: '', rating: 5, platform: 'internal', comment: '' });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);

        const savedReviews = localStorage.getItem(STORAGE_KEY);
        if (savedReviews) setReviews(JSON.parse(savedReviews));

        const savedClients = localStorage.getItem(CLIENTS_KEY);
        if (savedClients) setClients(JSON.parse(savedClients));
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save functions
  const saveReviews = (data) => {
    setReviews(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const saveClients = (data) => {
    setClients(data);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(data));
  };

  // Stats
  const stats = {
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : '-',
    totalReviews: reviews.length,
    pendingRequests: clients.filter(c => !c.reviewReceived).length,
    fiveStars: reviews.filter(r => r.rating === 5).length,
  };

  // Add client
  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name || !newClient.email) {
      alert('Veuillez remplir le nom et l\'email');
      return;
    }
    const client = {
      ...newClient,
      id: Date.now(),
      addedAt: new Date().toISOString(),
      requestSent: false,
      reviewReceived: false,
    };
    saveClients([...clients, client]);
    setNewClient({ name: '', email: '', phone: '' });
    setShowAddClient(false);
  };

  // Send review request (simulated - just marks as sent)
  const sendReviewRequest = (clientId) => {
    const updated = clients.map(c =>
      c.id === clientId ? { ...c, requestSent: true, requestSentAt: new Date().toISOString() } : c
    );
    saveClients(updated);
    alert('Demande d\'avis marquée comme envoyée. Envoyez manuellement l\'email avec le lien ci-dessous.');
  };

  // Add review manually
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.client || !newReview.comment) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    const review = {
      ...newReview,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    saveReviews([review, ...reviews]);
    
    // Mark client as having received review
    const updated = clients.map(c =>
      c.name === newReview.client ? { ...c, reviewReceived: true } : c
    );
    saveClients(updated);
    
    setNewReview({ client: '', rating: 5, platform: 'internal', comment: '' });
    setShowAddReview(false);
  };

  // Delete review
  const deleteReview = (id) => {
    if (confirm('Supprimer cet avis ?')) {
      saveReviews(reviews.filter(r => r.id !== id));
    }
  };

  // Delete client
  const deleteClient = (id) => {
    if (confirm('Supprimer ce client ?')) {
      saveClients(clients.filter(c => c.id !== id));
    }
  };

  // Review request link
  const reviewLink = `${window.location.origin}/review/${userId?.slice(0, 8) || 'agent'}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Generate email template
  const generateEmailTemplate = (client) => {
    return `Bonjour ${client.name},

Merci d'avoir fait appel à nos services pour votre projet immobilier.

Votre avis compte beaucoup pour nous ! Pourriez-vous prendre quelques instants pour partager votre expérience ?

Laissez votre avis ici : ${reviewLink}

Merci beaucoup,
Votre agent CSX Immobilier`;
  };

  const copyEmailTemplate = async (client) => {
    try {
      await navigator.clipboard.writeText(generateEmailTemplate(client));
      alert('Template d\'email copié !');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Loader2 size={32} style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

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
              <Star size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Collecte d'avis</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Gérez et collectez les avis de vos clients
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddClient(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Users size={18} />
              Ajouter client
            </button>
            <button
              onClick={() => setShowAddReview(true)}
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
              Ajouter avis
            </button>
          </div>
        </div>
      </div>

      {/* Review Link */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={18} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Lien de collecte d'avis (à partager)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            {reviewLink}
          </code>
          <button
            onClick={copyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
              border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              color: copied ? '#22c55e' : 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '20px',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={14} fill="var(--gold)" color="var(--gold)" />
            ))}
          </div>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--gold)' }}>{stats.avgRating}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Note moyenne</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <MessageSquare size={20} style={{ color: '#3b82f6', marginBottom: '8px' }} />
          <p style={{ fontSize: '28px', fontWeight: '700' }}>{stats.totalReviews}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avis collectés</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <Send size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
          <p style={{ fontSize: '28px', fontWeight: '700' }}>{stats.pendingRequests}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>En attente</p>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <CheckCircle size={20} style={{ color: '#22c55e', marginBottom: '8px' }} />
          <p style={{ fontSize: '28px', fontWeight: '700' }}>{stats.fiveStars}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>5 étoiles</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Clients to Request */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Clients à solliciter</h3>
          </div>
          
          {clients.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Users size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Ajoutez des clients pour leur demander un avis
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {clients.map(client => (
                <div key={client.id} style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{client.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client.email}</p>
                    {client.requestSent && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '2px 6px',
                        background: client.reviewReceived ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: client.reviewReceived ? '#22c55e' : '#f59e0b',
                        borderRadius: '4px',
                        fontSize: '10px',
                      }}>
                        {client.reviewReceived ? '✓ Avis reçu' : 'Demande envoyée'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => copyEmailTemplate(client)}
                      title="Copier l'email"
                      style={{
                        padding: '6px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <Mail size={14} />
                    </button>
                    {!client.requestSent && (
                      <button
                        onClick={() => sendReviewRequest(client.id)}
                        style={{
                          padding: '6px 10px',
                          background: 'var(--gold)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'var(--bg-primary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <Send size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteClient(client.id)}
                      style={{
                        padding: '6px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Avis reçus</h3>
          </div>
          
          {reviews.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Star size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Aucun avis collecté pour le moment
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {reviews.map(review => {
                const platform = platforms.find(p => p.id === review.platform);
                return (
                  <div key={review.id} style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>{review.client}</span>
                          <span style={{
                            padding: '2px 6px',
                            background: `${platform?.color}20`,
                            color: platform?.color,
                            borderRadius: '4px',
                            fontSize: '10px',
                          }}>
                            {platform?.icon} {platform?.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i <= review.rating ? 'var(--gold)' : 'transparent'}
                              color={i <= review.rating ? 'var(--gold)' : 'var(--text-muted)'}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </span>
                        <button
                          onClick={() => deleteReview(review.id)}
                          style={{
                            padding: '4px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {review.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <Modal title="Ajouter un client" onClose={() => setShowAddClient(false)}>
          <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Nom *</label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="Nom du client"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Email *</label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="email@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Téléphone</label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                style={inputStyle}
              />
            </div>
            <button type="submit" style={buttonStyle}>Ajouter</button>
          </form>
        </Modal>
      )}

      {/* Add Review Modal */}
      {showAddReview && (
        <Modal title="Ajouter un avis" onClose={() => setShowAddReview(false)}>
          <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Client *</label>
              <input
                type="text"
                value={newReview.client}
                onChange={(e) => setNewReview({ ...newReview, client: e.target.value })}
                placeholder="Nom du client"
                list="clients-list"
                style={inputStyle}
              />
              <datalist id="clients-list">
                {clients.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Note</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: i })}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Star
                      size={24}
                      fill={i <= newReview.rating ? 'var(--gold)' : 'transparent'}
                      color={i <= newReview.rating ? 'var(--gold)' : 'var(--text-muted)'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Plateforme</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {platforms.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, platform: p.id })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: newReview.platform === p.id ? `${p.color}20` : 'var(--bg-tertiary)',
                      border: `1px solid ${newReview.platform === p.id ? p.color : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      color: newReview.platform === p.id ? p.color : 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Commentaire *</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="L'avis du client..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <button type="submit" style={buttonStyle}>Ajouter l'avis</button>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Simple Modal Component
function Modal({ title, children, onClose }) {
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
        maxWidth: '450px',
        background: 'var(--bg-card)',
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
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '14px',
};

const buttonStyle = {
  padding: '14px',
  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
  border: 'none',
  borderRadius: '10px',
  color: 'var(--bg-primary)',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

export default ReviewCollection;
