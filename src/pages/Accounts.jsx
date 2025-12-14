import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Link2,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Building2,
  Info,
  Home,
  Share2,
  Camera,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';

const platformsConfig = [
  { 
    id: 'facebook', 
    name: 'Facebook', 
    color: '#1877F2', 
    icon: Share2,
    description: 'Publiez sur votre Page Facebook',
    canAutoConnect: true,
    oauthUrl: null, // Will be built dynamically
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    color: '#E4405F', 
    icon: Camera,
    description: 'Publication via Facebook Business',
    canAutoConnect: true,
    requiresFacebook: true,
  },
  { 
    id: 'seloger', 
    name: 'SeLoger', 
    color: '#E31C5F', 
    icon: Home,
    description: 'Portail immobilier - Connexion manuelle',
    canAutoConnect: false,
    manualUrl: 'https://www.seloger.com/pro',
  },
  { 
    id: 'leboncoin', 
    name: 'LeBonCoin', 
    color: '#F56B2A', 
    icon: Globe,
    description: 'Petites annonces - Connexion manuelle',
    canAutoConnect: false,
    manualUrl: 'https://www.leboncoin.fr/deposer-une-annonce',
  },
  { 
    id: 'airbnb', 
    name: 'Airbnb', 
    color: '#FF5A5F', 
    icon: Home,
    description: 'Location saisonnière - API Partenaire',
    canAutoConnect: false,
    manualUrl: 'https://www.airbnb.com/host',
  },
  { 
    id: 'booking', 
    name: 'Booking.com', 
    color: '#003580', 
    icon: Calendar,
    description: 'Location saisonnière - Programme Partenaire',
    canAutoConnect: false,
    manualUrl: 'https://join.booking.com',
  },
];

// Facebook App ID - user needs to create a Facebook App
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

function Accounts() {
  const [connections, setConnections] = useState({});
  const [listingStats, setListingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const [showFacebookSetup, setShowFacebookSetup] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state === 'facebook_oauth') {
      handleFacebookCallback(code);
      // Clean URL
      window.history.replaceState({}, '', '/accounts');
    }
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('platform_connections')
        .select('*');

      if (connectionsError) throw connectionsError;

      const connectionsMap = {};
      (connectionsData || []).forEach(conn => {
        connectionsMap[conn.platform] = conn;
      });
      setConnections(connectionsMap);

      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('platforms, status');

      if (listingsError) throw listingsError;

      const stats = {};
      (listings || []).forEach(listing => {
        if (listing.platforms && listing.status === 'active') {
          listing.platforms.forEach(platform => {
            stats[platform] = (stats[platform] || 0) + 1;
          });
        }
      });
      setListingStats(stats);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function initiateFacebookLogin() {
    if (!FACEBOOK_APP_ID) {
      setShowFacebookSetup(true);
      return;
    }

    const redirectUri = encodeURIComponent(window.location.origin + '/accounts');
    const scope = encodeURIComponent('pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish');
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&state=facebook_oauth&response_type=code`;
    
    window.location.href = authUrl;
  }

  async function handleFacebookCallback(code) {
    setUpdating('facebook');
    
    try {
      // Exchange code for token via Edge Function
      const { data, error } = await supabase.functions.invoke('facebook-oauth', {
        body: { code, redirectUri: window.location.origin + '/accounts' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Save connection
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('platform_connections').upsert({
        user_id: user.id,
        platform: 'facebook',
        status: 'connected',
        access_token: data.access_token,
        metadata: {
          user_id: data.user_id,
          pages: data.pages,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform' });

      // If user has Instagram connected to a page, also mark Instagram as connected
      if (data.pages?.some(p => p.instagram_business_account)) {
        await supabase.from('platform_connections').upsert({
          user_id: user.id,
          platform: 'instagram',
          status: 'connected',
          metadata: { via_facebook: true },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' });
      }

      await fetchData();

    } catch (err) {
      console.error('Facebook OAuth error:', err);
      setError('Erreur de connexion Facebook: ' + err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function disconnectPlatform(platformId) {
    setUpdating(platformId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('platform_connections').update({
        status: 'disconnected',
        access_token: null,
        metadata: null,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id).eq('platform', platformId);

      // If disconnecting Facebook, also disconnect Instagram
      if (platformId === 'facebook') {
        await supabase.from('platform_connections').update({
          status: 'disconnected',
          metadata: null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id).eq('platform', 'instagram');
      }

      await fetchData();

    } catch (err) {
      console.error('Error disconnecting:', err);
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function toggleManualConnection(platformId) {
    setUpdating(platformId);
    
    const currentConnection = connections[platformId];
    const newStatus = currentConnection?.status === 'connected' ? 'disconnected' : 'connected';

    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('platform_connections').upsert({
        user_id: user.id,
        platform: platformId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,platform' });

      setConnections(prev => ({
        ...prev,
        [platformId]: { ...prev[platformId], platform: platformId, status: newStatus }
      }));

    } catch (err) {
      console.error('Error updating connection:', err);
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const connectedCount = Object.values(connections).filter(c => c.status === 'connected').length;
  const autoConnectPlatforms = platformsConfig.filter(p => p.canAutoConnect);
  const manualPlatforms = platformsConfig.filter(p => !p.canAutoConnect);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>Plateformes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Connectez vos comptes pour publier automatiquement vos annonces
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
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Facebook Setup Modal */}
      {showFacebookSetup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Configuration Facebook requise</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Pour connecter Facebook, vous devez:
            </p>
            <ol style={{ color: 'var(--text-secondary)', marginBottom: '24px', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Creer une app sur <a href="https://developers.facebook.com" target="_blank" style={{ color: 'var(--gold)' }}>developers.facebook.com</a></li>
              <li>Ajouter "Facebook Login" comme produit</li>
              <li>Configurer les permissions: pages_manage_posts, instagram_content_publish</li>
              <li>Ajouter votre App ID dans le fichier .env: <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>VITE_FACEBOOK_APP_ID=xxx</code></li>
              <li>Deployer l'Edge Function facebook-oauth</li>
            </ol>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFacebookSetup(false)}
                style={{
                  padding: '12px 24px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
              <a
                href="https://developers.facebook.com/apps/create/"
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#1877F2',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}
              >
                Creer une App Facebook
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--gold)', marginBottom: '4px' }}>{connectedCount}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Plateformes connectees</p>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' }}>
            {Object.values(listingStats).reduce((a, b) => a + b, 0)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Publications actives</p>
        </div>
        <div style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>{platformsConfig.length}</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Plateformes disponibles</p>
        </div>
      </div>

      {/* Auto-Connect Platforms */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Link2 size={20} style={{ color: 'var(--gold)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Connexion automatique</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Ces plateformes supportent la publication automatique via API
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {autoConnectPlatforms.map(platform => {
            const connection = connections[platform.id];
            const isConnected = connection?.status === 'connected';
            const Icon = platform.icon;
            const listingCount = listingStats[platform.id] || 0;

            return (
              <div
                key={platform.id}
                style={{
                  padding: '24px',
                  background: 'var(--bg-card)',
                  border: `1px solid ${isConnected ? platform.color : 'var(--border-color)'}`,
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: `${platform.color}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={24} style={{ color: platform.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>{platform.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{platform.description}</p>
                    </div>
                  </div>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: isConnected ? '#22c55e' : 'var(--text-muted)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {isConnected ? <Check size={14} /> : <X size={14} />}
                    {isConnected ? 'Connecte' : 'Non connecte'}
                  </span>
                </div>

                {isConnected && connection?.metadata?.pages && (
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Pages connectees:</p>
                    {connection.metadata.pages.map(page => (
                      <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Check size={14} style={{ color: '#22c55e' }} />
                        <span>{page.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isConnected && listingCount > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {listingCount} annonce{listingCount > 1 ? 's' : ''} active{listingCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {platform.requiresFacebook && !connections['facebook']?.status === 'connected' ? (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#f59e0b',
                  }}>
                    Connectez d'abord Facebook pour activer Instagram
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (isConnected) {
                        disconnectPlatform(platform.id);
                      } else if (platform.id === 'facebook' || platform.id === 'instagram') {
                        initiateFacebookLogin();
                      }
                    }}
                    disabled={updating === platform.id}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: isConnected ? 'rgba(239, 68, 68, 0.1)' : platform.color,
                      border: `1px solid ${isConnected ? 'rgba(239, 68, 68, 0.2)' : platform.color}`,
                      borderRadius: '10px',
                      color: isConnected ? 'var(--error)' : 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      opacity: updating === platform.id ? 0.7 : 1,
                    }}
                  >
                    {updating === platform.id ? (
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : isConnected ? (
                      <>
                        <X size={16} />
                        Deconnecter
                      </>
                    ) : (
                      <>
                        <Link2 size={16} />
                        Connecter avec {platform.name}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Platforms */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Lock size={20} style={{ color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Portails immobiliers</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Ces plateformes necessitent une publication manuelle ou un partenariat commercial
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {manualPlatforms.map(platform => {
            const connection = connections[platform.id];
            const isConnected = connection?.status === 'connected';
            const Icon = platform.icon;
            const listingCount = listingStats[platform.id] || 0;

            return (
              <div
                key={platform.id}
                style={{
                  padding: '24px',
                  background: 'var(--bg-card)',
                  border: `1px solid ${isConnected ? platform.color : 'var(--border-color)'}`,
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: `${platform.color}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon size={24} style={{ color: platform.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>{platform.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{platform.description}</p>
                    </div>
                  </div>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: isConnected ? '#22c55e' : 'var(--text-muted)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {isConnected ? <Check size={14} /> : <X size={14} />}
                    {isConnected ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {isConnected && listingCount > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {listingCount} annonce{listingCount > 1 ? 's' : ''} active{listingCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => toggleManualConnection(platform.id)}
                    disabled={updating === platform.id}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: isConnected ? 'rgba(239, 68, 68, 0.1)' : `${platform.color}20`,
                      border: `1px solid ${isConnected ? 'rgba(239, 68, 68, 0.2)' : platform.color}`,
                      borderRadius: '10px',
                      color: isConnected ? 'var(--error)' : platform.color,
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      opacity: updating === platform.id ? 0.7 : 1,
                    }}
                  >
                    {updating === platform.id ? (
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : isConnected ? (
                      <>
                        <X size={16} />
                        Desactiver
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Marquer actif
                      </>
                    )}
                  </button>

                  <a
                    href={platform.manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                    }}
                    title="Ouvrir la plateforme"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Accounts;
