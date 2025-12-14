import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';
import {
  LayoutDashboard,
  Building2,
  Users,
  Link2,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  ChevronRight,
  Crown
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Fetch real leads count
  useEffect(() => {
    async function fetchLeadsCount() {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');
      
      if (!error && count !== null) {
        setNewLeadsCount(count);
      }
    }

    fetchLeadsCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads' 
      }, () => {
        fetchLeadsCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), hasSubmenu: true },
    { path: '/listings', icon: Building2, label: t('nav.listings') },
    { path: '/leads', icon: Users, label: t('nav.leads'), badge: newLeadsCount > 0 ? newLeadsCount : null },
    { path: '/accounts', icon: Link2, label: t('nav.platforms') },
    { path: '/ai-tools', icon: Sparkles, label: t('nav.aiTools') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <Link to="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '18px',
            color: 'var(--bg-primary)',
          }}>
            C
          </div>
          <div>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}>CSX</span>
            <span style={{
              display: 'block',
              fontSize: '10px',
              color: 'var(--gold)',
              fontWeight: '600',
              letterSpacing: '2px',
              marginTop: '-2px',
            }}>IMMOBILIER</span>
          </div>
        </Link>
      </div>

      {/* New Listing Button */}
      <div style={{ padding: '20px 16px' }}>
        <Link
          to="/listings/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            borderRadius: '10px',
            color: 'var(--bg-primary)',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={18} />
          {t('nav.newListing')}
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '0 12px',
        overflowY: 'auto',
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/listings' && location.pathname.startsWith('/listings'));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
            >
              <item.icon size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  padding: '2px 8px',
                  background: 'var(--gold)',
                  color: 'var(--bg-primary)',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>
                  {item.badge}
                </span>
              )}
              {item.hasSubmenu && (
                <ChevronRight size={16} style={{ opacity: 0.5 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      <div style={{ padding: '16px' }}>
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <Crown size={16} style={{ color: 'var(--gold)' }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>Plan Pro</span>
          </div>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
            lineHeight: '1.4',
          }}>
            Débloquez toutes les fonctionnalités et plateformes
          </p>
          <button style={{
            width: '100%',
            padding: '10px',
            background: 'var(--gold)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--bg-primary)',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
            {t('nav.upgradeToPro')}
          </button>
        </div>
      </div>

      {/* Language Switcher */}
      <div style={{ padding: '0 16px 8px' }}>
        <LanguageSwitcher />
      </div>

      {/* User Profile */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px',
            color: 'var(--bg-primary)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontWeight: '600',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{displayName}</p>
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Déconnexion"
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
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
