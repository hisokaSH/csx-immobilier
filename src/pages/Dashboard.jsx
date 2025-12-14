import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Building2,
  Users,
  Eye,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MapPin
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalLeads: 0,
    newLeads: 0,
  });
  const [recentListings, setRecentListings] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch listings
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        // Fetch leads with listing info
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select(`
            *,
            listing:listings(id, title)
          `)
          .order('created_at', { ascending: false });

        if (leadsError) throw leadsError;

        // Calculate stats
        const totalListings = listings?.length || 0;
        const activeListings = listings?.filter(l => l.status === 'active').length || 0;
        const totalViews = listings?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;
        const totalLeads = leads?.length || 0;
        const newLeads = leads?.filter(l => l.status === 'new').length || 0;

        setStats({
          totalListings,
          activeListings,
          totalViews,
          totalLeads,
          newLeads,
        });

        setRecentListings(listings?.slice(0, 5) || []);
        setRecentLeads(leads?.slice(0, 5) || []);

      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Annonces Actives',
      value: stats.activeListings,
      total: stats.totalListings,
      icon: Building2,
      color: '#d4af37',
      bgColor: 'rgba(212, 175, 55, 0.1)',
    },
    {
      label: 'Vues Totales',
      value: stats.totalViews,
      icon: Eye,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Nouveaux Leads',
      value: stats.newLeads,
      total: stats.totalLeads,
      icon: Users,
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      label: 'Taux de Conversion',
      value: stats.totalViews > 0 
        ? Math.round((stats.totalLeads / stats.totalViews) * 100) 
        : 0,
      suffix: '%',
      icon: TrendingUp,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.1)',
    },
  ];

  const formatPrice = (price, priceType) => {
    if (!price) return '';
    const formatted = new Intl.NumberFormat('fr-FR').format(price);
    if (priceType === 'rent') return `${formatted} €/mois`;
    if (priceType === 'vacation') return `${formatted} €/nuit`;
    return `${formatted} €`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
          <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
            Bonjour, {displayName}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Voici un aperçu de votre activité immobilière
          </p>
        </div>
        <Link
          to="/listings/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            color: 'var(--bg-primary)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          <Plus size={18} />
          Nouvelle Annonce
        </Link>
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

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {statCards.map((stat, index) => (
          <div key={index} style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: stat.bgColor,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {stat.value.toLocaleString()}{stat.suffix || ''}
              {stat.total !== undefined && stat.total > 0 && (
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '400' }}>
                  {' '}/ {stat.total}
                </span>
              )}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <Link to="/listings/new" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--gold)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Plus size={24} style={{ color: 'var(--bg-primary)' }} />
          </div>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Créer une annonce</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Publier sur toutes les plateformes</p>
          </div>
        </Link>

        <Link to="/ai-tools" style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={24} style={{ color: '#a855f7' }} />
          </div>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Générer avec l'IA</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Descriptions automatiques</p>
          </div>
        </Link>

        <Link to="/leads" style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          textDecoration: 'none',
          color: 'inherit',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={24} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Voir les leads</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {stats.newLeads > 0 ? `${stats.newLeads} nouveaux à traiter` : 'Aucun nouveau lead'}
            </p>
          </div>
        </Link>
      </div>

      {/* Empty State */}
      {stats.totalListings === 0 && (
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
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Building2 size={36} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
            Commencez par créer votre première annonce
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            marginBottom: '24px',
            maxWidth: '400px',
            margin: '0 auto 24px',
          }}>
            Publiez votre premier bien et diffusez-le sur toutes les plateformes en un clic.
          </p>
          <Link
            to="/listings/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              color: 'var(--bg-primary)',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            <Plus size={18} />
            Créer ma première annonce
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      {stats.totalListings > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
          {/* Recent Listings */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Annonces Récentes</h3>
              <Link to="/listings" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: 'var(--gold)',
                fontWeight: '500',
              }}>
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>
            
            {recentListings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentListings.map((listing) => (
                  <Link 
                    key={listing.id} 
                    to={`/listings/${listing.id}/edit`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: listing.images?.[0] 
                        ? `url(${listing.images[0]}) center/cover`
                        : 'rgba(212, 175, 55, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {!listing.images?.[0] && <Building2 size={20} style={{ color: 'var(--gold)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {listing.title || 'Sans titre'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '600' }}>
                        {formatPrice(listing.price, listing.price_type)}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      background: listing.status === 'active' 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      color: listing.status === 'active' ? '#22c55e' : 'var(--text-muted)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}>
                      {listing.status === 'active' ? 'Active' : 
                       listing.status === 'draft' ? 'Brouillon' : 
                       listing.status === 'paused' ? 'En pause' : listing.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                Aucune annonce récente
              </p>
            )}
          </div>

          {/* Recent Leads */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Leads Récents</h3>
              <Link to="/leads" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: 'var(--gold)',
                fontWeight: '500',
              }}>
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>
            
            {recentLeads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentLeads.map((lead) => (
                  <div key={lead.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '10px',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: lead.status === 'new' 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: lead.status === 'new' ? '#22c55e' : '#3b82f6',
                    }}>
                      {(lead.name || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {lead.name || 'Contact inconnu'}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {lead.listing?.title || lead.source || 'Source inconnue'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'block',
                        padding: '4px 10px',
                        background: lead.status === 'new' 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: lead.status === 'new' ? '#22c55e' : 'var(--text-muted)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                      }}>
                        {lead.status === 'new' ? 'Nouveau' : 
                         lead.status === 'contacted' ? 'Contacté' :
                         lead.status === 'qualified' ? 'Qualifié' : lead.status}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {formatDate(lead.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px',
                color: 'var(--text-muted)',
              }}>
                <Users size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontSize: '14px' }}>Aucun lead pour le moment</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Les leads apparaîtront ici quand des prospects vous contacteront
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
