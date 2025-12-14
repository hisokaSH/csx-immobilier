import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  Zap,
  Calendar,
  BarChart3,
  FileText,
  Image,
  QrCode,
  Target,
  Users,
  Star,
  TrendingUp,
  Languages,
  Sparkles,
  ArrowRight,
  Play,
  Mic,
  MessageCircle,
  MapPin
} from 'lucide-react';

const tools = [
  {
    category: 'Intelligence Artificielle',
    items: [
      {
        name: 'Estimation IA',
        description: 'Estimez la valeur d\'un bien instantanément',
        icon: Calculator,
        path: '/tools/valuation',
        color: '#22c55e',
        badge: 'Populaire',
      },
      {
        name: 'Lead Scoring',
        description: 'Priorisez vos prospects par probabilité d\'achat',
        icon: Target,
        path: '/tools/lead-scoring',
        color: '#ef4444',
        badge: 'IA',
      },
      {
        name: 'Retouche Photo',
        description: 'Améliorez vos photos automatiquement',
        icon: Image,
        path: '/tools/photo-enhancement',
        color: '#8b5cf6',
        badge: 'IA',
      },
      {
        name: 'Traduction Multi-langue',
        description: 'Traduisez vos annonces pour l\'international',
        icon: Languages,
        path: '/tools/translation',
        color: '#3b82f6',
        badge: 'IA',
      },
      {
        name: 'Notes Vocales',
        description: 'Enregistrez et convertissez en descriptions',
        icon: Mic,
        path: '/tools/voice-notes',
        color: '#ef4444',
        badge: 'IA',
      },
    ],
  },
  {
    category: 'Communication',
    items: [
      {
        name: 'WhatsApp Business',
        description: 'Gérez vos conversations WhatsApp',
        icon: MessageCircle,
        path: '/tools/whatsapp',
        color: '#25D366',
        badge: 'Nouveau',
      },
      {
        name: 'Suivi Automatique',
        description: 'Séquences email et SMS personnalisées',
        icon: Zap,
        path: '/tools/followup',
        color: '#f97316',
      },
      {
        name: 'Collecte d\'Avis',
        description: 'Demandez des avis automatiquement',
        icon: Star,
        path: '/tools/reviews',
        color: '#eab308',
      },
    ],
  },
  {
    category: 'Gestion Clients',
    items: [
      {
        name: 'Calendrier Intelligent',
        description: 'Gérez vos RDV et visites',
        icon: Calendar,
        path: '/tools/calendar',
        color: '#d4af37',
      },
      {
        name: 'Portail Client',
        description: 'Espace personnel pour vos clients',
        icon: Users,
        path: '/tools/client-portal',
        color: '#06b6d4',
      },
    ],
  },
  {
    category: 'Analyse & Rapports',
    items: [
      {
        name: 'Analyse de Marché',
        description: 'Tendances et statistiques immobilières',
        icon: BarChart3,
        path: '/tools/market-insights',
        color: '#3b82f6',
      },
      {
        name: 'Performance',
        description: 'Analysez vos résultats en détail',
        icon: TrendingUp,
        path: '/tools/performance',
        color: '#22c55e',
      },
      {
        name: 'Infos Quartier',
        description: 'Données environnement et commodités',
        icon: MapPin,
        path: '/tools/neighborhood',
        color: '#3b82f6',
        badge: 'Nouveau',
      },
      {
        name: 'Simulateur de Prêt',
        description: 'Calculez les mensualités clients',
        icon: Calculator,
        path: '/tools/mortgage',
        color: '#8b5cf6',
      },
    ],
  },
  {
    category: 'Documents & Marketing',
    items: [
      {
        name: 'Générateur de Documents',
        description: 'Créez mandats, bons de visite, etc.',
        icon: FileText,
        path: '/tools/documents',
        color: '#f97316',
      },
      {
        name: 'Flyers QR Code',
        description: 'Créez des flyers imprimables',
        icon: QrCode,
        path: '/tools/qr-flyer',
        color: '#ec4899',
      },
      {
        name: 'Visite Virtuelle',
        description: 'Créez des vidéos immersives',
        icon: Play,
        path: '/tools/virtual-tour',
        color: '#ec4899',
        badge: 'Nouveau',
      },
    ],
  },
];

function ToolsHub() {
  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
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
            <Sparkles size={24} style={{ color: '#d4af37' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Outils</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              18 outils pour booster votre activité immobilière
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Outils IA', count: 5, color: '#8b5cf6' },
          { label: 'Communication', count: 3, color: '#25D366' },
          { label: 'Analyse', count: 4, color: '#3b82f6' },
          { label: 'Marketing', count: 3, color: '#ec4899' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>
              {stat.count}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tools Grid by Category */}
      {tools.map((category, catIdx) => (
        <div key={catIdx} style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {category.category}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {category.items.map((tool, idx) => (
              <Link
                key={idx}
                to={tool.path}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{
                  padding: '24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = tool.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 10px 30px ${tool.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  {tool.badge && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 8px',
                      background: tool.badge === 'IA' 
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' 
                        : tool.badge === 'Nouveau'
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : 'linear-gradient(135deg, #d4af37 0%, #b8972e 100%)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}>
                      {tool.badge}
                    </span>
                  )}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: `${tool.color}15`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <tool.icon size={24} style={{ color: tool.color }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {tool.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {tool.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: tool.color,
                    fontSize: '13px',
                    fontWeight: '600',
                  }}>
                    Accéder <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Pro Tips */}
      <div style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#d4af37',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkles size={24} style={{ color: 'black' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              💡 Astuce Pro
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Combinez plusieurs outils pour maximiser votre efficacité ! Par exemple, utilisez 
              <strong> Notes Vocales</strong> pour enregistrer vos observations lors des visites, 
              puis <strong>Retouche Photo</strong> pour sublimer vos images, et enfin 
              <strong> Flyers QR Code</strong> pour créer des supports marketing professionnels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToolsHub;
