import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Save,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Crown,
  Zap,
  Building2,
  Loader2
} from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    features: ['5 annonces actives', '2 plateformes', 'Support email'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    popular: true,
    features: ['25 annonces actives', 'Toutes les plateformes', 'IA illimitee', 'Support prioritaire'],
  },
  {
    id: 'agence',
    name: 'Agence',
    price: 249,
    features: ['Annonces illimitees', 'Multi-utilisateurs', 'API access', 'Account manager'],
  },
];

function Settings() {
  const { user, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Profile form
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    website: '',
  });

  // Subscription info
  const [subscription, setSubscription] = useState({
    status: null,
    plan: null,
    current_period_end: null,
  });

  // Password form
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Billing loading states
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Load profile and subscription
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          website: data.website || '',
        });
        setSubscription({
          status: data.subscription_status,
          plan: data.subscription_plan,
          current_period_end: data.subscription_current_period_end,
        });
      }
    }

    if (user) {
      loadProfile();
    }

    // Check for checkout success/cancel
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccess('Abonnement active avec succes!');
      setActiveTab('billing');
      window.history.replaceState({}, '', '/settings');
      // Reload subscription info
      setTimeout(loadProfile, 2000);
    } else if (params.get('canceled') === 'true') {
      setError('Paiement annule');
      setActiveTab('billing');
      window.history.replaceState({}, '', '/settings');
    }
  }, [user]);

  const handleProfileSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        website: profile.website,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Profil mis a jour');
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwords.new.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await updatePassword(passwords.new);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Mot de passe mis a jour');
      setPasswords({ new: '', confirm: '' });
    }
    setLoading(false);
  };

  const handleCheckout = async (planId) => {
    setCheckoutLoading(planId);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Erreur lors du paiement');
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-portal', {});

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Redirect to Stripe Portal
      window.location.href = data.url;

    } catch (err) {
      console.error('Portal error:', err);
      setError(err.message || 'Erreur lors de l\'acces au portail');
      setPortalLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Securite', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>Parametres</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Gerez votre compte et vos preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
          marginBottom: '24px',
          color: '#22c55e',
        }}>
          <Check size={20} />
          <span>{success}</span>
        </div>
      )}

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
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSuccess(null); setError(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
            Informations personnelles
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Telephone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+590 690 00 00 00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Societe
                </label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  placeholder="Nom de votre agence"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Site web
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://www.monagence.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              onClick={handleProfileSave}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--bg-primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                alignSelf: 'flex-start',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
            Changer le mot de passe
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={loading || !passwords.new || !passwords.confirm}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--bg-primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                opacity: loading || !passwords.new || !passwords.confirm ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={18} />}
              {loading ? 'Mise a jour...' : 'Mettre a jour'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
            Preferences de notification
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Nouveau lead', desc: 'Recevez une notification quand un prospect vous contacte' },
              { label: 'Rapport hebdomadaire', desc: 'Resume de votre activite chaque semaine' },
              { label: 'Mises a jour produit', desc: 'Nouvelles fonctionnalites et ameliorations' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
              }}>
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <label style={{ position: 'relative', width: '48px', height: '26px' }}>
                  <input type="checkbox" defaultChecked={idx === 0} style={{ display: 'none' }} />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    background: idx === 0 ? 'var(--gold)' : 'var(--border-color)',
                    borderRadius: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    <span style={{
                      position: 'absolute',
                      width: '20px',
                      height: '20px',
                      background: 'white',
                      borderRadius: '50%',
                      top: '3px',
                      left: idx === 0 ? '25px' : '3px',
                      transition: 'all 0.2s',
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div>
          {/* Current Plan */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Votre abonnement
            </h3>

            {subscription.status === 'active' ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'var(--gold)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Crown size={28} style={{ color: 'var(--bg-primary)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: '700', textTransform: 'capitalize' }}>
                      Plan {subscription.plan}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      Renouvellement le {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  {portalLoading ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <ExternalLink size={18} />
                  )}
                  Gerer mon abonnement
                </button>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <Zap size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>Aucun abonnement actif</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Choisissez un plan ci-dessous pour debloquer toutes les fonctionnalites
                </p>
              </div>
            )}
          </div>

          {/* Plans */}
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            {subscription.status === 'active' ? 'Changer de plan' : 'Choisir un plan'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {PLANS.map(plan => {
              const isCurrentPlan = subscription.plan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  style={{
                    padding: '24px',
                    background: 'var(--bg-card)',
                    border: `2px solid ${plan.popular ? 'var(--gold)' : isCurrentPlan ? '#22c55e' : 'var(--border-color)'}`,
                    borderRadius: '16px',
                    position: 'relative',
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '4px 16px',
                      background: 'var(--gold)',
                      color: 'var(--bg-primary)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      POPULAIRE
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '4px 16px',
                      background: '#22c55e',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}>
                      ACTUEL
                    </div>
                  )}

                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    {plan.name}
                  </h4>
                  <p style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '700' }}>{plan.price}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}> EUR/mois</span>
                  </p>

                  <ul style={{ marginBottom: '20px' }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px',
                      }}>
                        <Check size={16} style={{ color: 'var(--gold)' }} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isCurrentPlan || checkoutLoading === plan.id}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: isCurrentPlan 
                        ? 'var(--bg-tertiary)' 
                        : plan.popular 
                          ? 'var(--gold)' 
                          : 'var(--bg-tertiary)',
                      border: isCurrentPlan ? '1px solid var(--border-color)' : 'none',
                      borderRadius: '10px',
                      color: isCurrentPlan 
                        ? 'var(--text-muted)' 
                        : plan.popular 
                          ? 'var(--bg-primary)' 
                          : 'var(--text-primary)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: isCurrentPlan ? 'default' : 'pointer',
                      opacity: checkoutLoading === plan.id ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {checkoutLoading === plan.id ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Chargement...
                      </>
                    ) : isCurrentPlan ? (
                      'Plan actuel'
                    ) : (
                      'Choisir ce plan'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Settings;
