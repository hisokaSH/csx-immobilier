import React, { useState } from 'react';
import {
  Star,
  Send,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';

const mockReviews = [
  {
    id: 1,
    client: 'Marie Dupont',
    rating: 5,
    date: '2024-01-15',
    platform: 'Google',
    comment: 'Excellent service ! L\'agent a été très professionnel et réactif. J\'ai trouvé mon appartement en moins d\'un mois.',
    status: 'published',
  },
  {
    id: 2,
    client: 'Jean Martin',
    rating: 5,
    date: '2024-01-10',
    platform: 'Facebook',
    comment: 'Très satisfait de l\'accompagnement. Merci pour votre disponibilité et vos conseils avisés.',
    status: 'published',
  },
  {
    id: 3,
    client: 'Sophie Bernard',
    rating: 4,
    date: '2024-01-05',
    platform: 'Google',
    comment: 'Bonne expérience dans l\'ensemble. Les visites étaient bien organisées.',
    status: 'published',
  },
];

const recentClients = [
  { id: 1, name: 'Pierre Leroy', email: 'p.leroy@email.com', saleDate: '2024-01-12', requestSent: false },
  { id: 2, name: 'Claire Moreau', email: 'claire.m@email.com', saleDate: '2024-01-08', requestSent: true, requestDate: '2024-01-10' },
  { id: 3, name: 'Lucas Petit', email: 'lucas.p@email.com', saleDate: '2024-01-05', requestSent: true, requestDate: '2024-01-07' },
];

function ReviewCollection() {
  const [reviews, setReviews] = useState(mockReviews);
  const [clients, setClients] = useState(recentClients);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const stats = {
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    totalReviews: reviews.length,
    pendingRequests: clients.filter(c => c.requestSent && !reviews.find(r => r.client === c.name)).length,
    responseRate: 67,
  };

  const sendReviewRequest = (clientId) => {
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, requestSent: true, requestDate: new Date().toISOString().split('T')[0] } : c
    ));
    alert('Demande d\'avis envoyée !');
  };

  const copyReviewLink = () => {
    navigator.clipboard.writeText('https://g.page/r/CSX-Immobilier/review');
    alert('Lien copié !');
  };

  const filteredReviews = selectedPlatform === 'all' 
    ? reviews 
    : reviews.filter(r => r.platform.toLowerCase() === selectedPlatform);

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
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Avis clients</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Collectez et gérez les avis de vos clients satisfaits
              </p>
            </div>
          </div>
          <button
            onClick={copyReviewLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <Copy size={18} />
            Copier lien Google
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
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={20} 
                fill={star <= Math.round(parseFloat(stats.avgRating)) ? 'var(--gold)' : 'transparent'}
                style={{ color: 'var(--gold)' }} 
              />
            ))}
          </div>
          <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--gold)' }}>{stats.avgRating}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Note moyenne</p>
        </div>
        {[
          { label: 'Avis publiés', value: stats.totalReviews, icon: MessageSquare, color: '#22c55e' },
          { label: 'Demandes en attente', value: stats.pendingRequests, icon: Clock, color: '#f97316' },
          { label: 'Taux de réponse', value: `${stats.responseRate}%`, icon: TrendingUp, color: '#3b82f6' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Reviews List */}
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
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Avis récents</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'google', 'facebook'].map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  style={{
                    padding: '6px 12px',
                    background: selectedPlatform === platform ? 'var(--gold)' : 'var(--bg-tertiary)',
                    border: 'none',
                    borderRadius: '6px',
                    color: selectedPlatform === platform ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {platform === 'all' ? 'Tous' : platform}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredReviews.map((review, idx) => (
              <div key={review.id} style={{
                padding: '20px',
                borderBottom: idx < filteredReviews.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                      {review.client.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{review.client}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={12} 
                              fill={star <= review.rating ? 'var(--gold)' : 'transparent'}
                              style={{ color: 'var(--gold)' }} 
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    background: review.platform === 'Google' ? 'rgba(66, 133, 244, 0.1)' : 'rgba(24, 119, 242, 0.1)',
                    color: review.platform === 'Google' ? '#4285f4' : '#1877f2',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {review.platform}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Request Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Recent Sales */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
              Ventes récentes - Demander un avis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {clients.map(client => (
                <div key={client.id} style={{
                  padding: '14px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{client.name}</p>
                    {client.requestSent ? (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#22c55e',
                      }}>
                        <CheckCircle size={12} />
                        Envoyé
                      </span>
                    ) : null}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Vente le {client.saleDate}
                  </p>
                  {!client.requestSent ? (
                    <button
                      onClick={() => sendReviewRequest(client.id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--gold)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'var(--bg-primary)',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Send size={14} />
                      Demander un avis
                    </button>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Demande envoyée le {client.requestDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Award size={18} style={{ color: '#22c55e' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Bonnes pratiques</h4>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
              <li>Demandez l'avis 3-5 jours après la vente</li>
              <li>Personnalisez votre message</li>
              <li>Répondez toujours aux avis (positifs et négatifs)</li>
              <li>Partagez les meilleurs avis sur vos réseaux</li>
            </ul>
          </div>

          {/* Review Links */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
              Liens de dépôt d'avis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { platform: 'Google Business', color: '#4285f4', url: 'https://g.page/r/...' },
                { platform: 'Facebook', color: '#1877f2', url: 'https://facebook.com/...' },
                { platform: 'Trustpilot', color: '#00b67a', url: 'https://trustpilot.com/...' },
              ].map(link => (
                <div key={link.platform} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{link.platform}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { navigator.clipboard.writeText(link.url); alert('Copié !'); }}
                      style={{
                        padding: '6px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Copy size={12} />
                    </button>
                    <button style={{
                      padding: '6px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewCollection;
