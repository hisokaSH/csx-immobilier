import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Link2, 
  Sparkles, 
  Bot, 
  Mail, 
  BarChart3, 
  Smartphone,
  Play,
  Check,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Users,
  Building2,
  Globe,
  ChevronRight,
  Quote
} from 'lucide-react';

const CSXLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Platform logos as SVG components
  const PlatformLogos = {
    Facebook: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    Instagram: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    Airbnb: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M12.001 18.275c-.208-.372-.385-.752-.573-1.123-.51-1.018-.992-2.058-1.404-3.126-.393-1.018-.715-2.068-.944-3.135-.188-.87-.292-1.724-.282-2.595.01-.767.135-1.51.437-2.203.343-.787.878-1.37 1.617-1.757.479-.25.992-.376 1.531-.383.54-.007 1.054.105 1.537.34.76.37 1.316.939 1.678 1.727.323.704.465 1.46.481 2.24.018.9-.082 1.785-.275 2.66-.225 1.016-.532 2.01-.902 2.983-.415 1.087-.899 2.145-1.413 3.182-.197.397-.39.797-.616 1.19-.025 0-.05 0-.083 0-.066 0-.123 0-.189 0zm-.001 1.725c.1.182.19.357.288.53.596 1.05 1.262 2.054 2.046 2.973.27.316.56.613.878.883.202.171.42.325.659.446.341.171.7.233 1.073.158.417-.083.758-.29 1.033-.597.367-.41.571-.896.663-1.431.103-.6.075-1.197-.04-1.79-.137-.708-.374-1.382-.66-2.038-.538-1.23-1.2-2.393-1.927-3.516-.485-.749-.996-1.48-1.533-2.19-.073-.096-.148-.191-.226-.292-.077.1-.15.19-.22.284-.538.712-1.052 1.446-1.54 2.2-.732 1.13-1.4 2.3-1.942 3.54-.284.65-.52 1.318-.66 2.02-.119.6-.15 1.203-.042 1.81.09.512.28.98.618 1.38.289.343.65.571 1.095.66.357.07.7.016 1.028-.14.257-.122.49-.283.707-.466.313-.264.598-.558.864-.87.783-.918 1.448-1.918 2.044-2.965.102-.179.196-.362.294-.543l-.001-.006zm7.124-1.5c-.035.308-.098.612-.18.912-.233.84-.616 1.607-1.128 2.305-.457.622-1.003 1.148-1.656 1.556-.373.232-.77.417-1.202.518-.553.128-1.09.078-1.6-.167-.398-.19-.73-.469-1.023-.795-.56-.625-1.008-1.335-1.406-2.08-.026-.048-.054-.095-.086-.152-.036.062-.067.113-.096.165-.394.74-.839 1.444-1.391 2.064-.297.334-.634.62-1.04.816-.501.24-1.027.294-1.572.172-.44-.1-.844-.285-1.223-.52-.648-.402-1.19-.922-1.647-1.535-.52-.698-.91-1.467-1.15-2.31-.085-.3-.15-.605-.188-.917-.01-.078-.026-.156-.04-.234h-.01c0 .018-.003.035-.003.053-.007.7.07 1.387.22 2.067.22 1.002.575 1.954 1.072 2.85.475.856 1.058 1.628 1.776 2.288.548.503 1.157.913 1.85 1.187.857.338 1.74.418 2.64.228.67-.14 1.28-.415 1.835-.798.814-.562 1.474-1.27 2.048-2.062.09-.124.175-.25.266-.38.088.126.17.246.256.364.575.794 1.237 1.505 2.053 2.07.55.38 1.152.653 1.815.794.908.194 1.8.118 2.665-.223.69-.272 1.295-.68 1.84-1.178.72-.66 1.306-1.432 1.783-2.29.498-.895.856-1.847 1.078-2.85.152-.685.23-1.378.22-2.08 0-.017-.002-.033-.003-.05h-.01c-.013.074-.028.148-.037.222z"/>
      </svg>
    ),
    SeLoger: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.08 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
      </svg>
    ),
    LeBonCoin: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
      </svg>
    ),
    IAD: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
    LogicImmo: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    PAP: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm3-4H6v-2h9v2zm0-4H6V7h9v2z"/>
      </svg>
    ),
  };

  const platforms = [
    { name: 'Facebook', Logo: PlatformLogos.Facebook, color: '#1877F2' },
    { name: 'Instagram', Logo: PlatformLogos.Instagram, color: '#E4405F' },
    { name: 'Airbnb', Logo: PlatformLogos.Airbnb, color: '#FF5A5F' },
    { name: 'SeLoger', Logo: PlatformLogos.SeLoger, color: '#E31C5F' },
    { name: 'LeBonCoin', Logo: PlatformLogos.LeBonCoin, color: '#F56B2A' },
    { name: 'IAD', Logo: PlatformLogos.IAD, color: '#00B388' },
    { name: 'Logic-Immo', Logo: PlatformLogos.LogicImmo, color: '#0066CC' },
    { name: 'PAP', Logo: PlatformLogos.PAP, color: '#8B5CF6' },
  ];

  const features = [
    {
      title: 'Syndication Multi-Plateforme',
      description: 'Publiez une annonce, diffusez partout. Connectez vos comptes Facebook, Instagram, Airbnb, SeLoger, LeBonCoin et plus encore.',
      Icon: Link2,
      highlight: 'Gagnez 5h par semaine',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    },
    {
      title: 'Descriptions IA',
      description: 'Générez des descriptions immobilières captivantes à partir de vos photos. Notre IA comprend le marché français et caribéen.',
      Icon: Sparkles,
      highlight: '10x plus rapide',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    },
    {
      title: 'Chatbot Qualification',
      description: 'Qualifiez automatiquement vos leads 24h/24. Réponses instantanées en français, anglais et créole.',
      Icon: Bot,
      highlight: 'Ne ratez plus aucun lead',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80',
    },
    {
      title: 'Suivi Automatisé',
      description: 'Séquences email et SMS personnalisées. Relancez vos prospects au bon moment, automatiquement.',
      Icon: Mail,
      highlight: '+40% de conversions',
      image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80',
    },
    {
      title: 'Analyse de Marché',
      description: 'Prix au m², tendances locales, estimation automatique. Données en temps réel pour France et DOM-TOM.',
      Icon: BarChart3,
      highlight: 'Données temps réel',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    },
    {
      title: 'Contenu Social',
      description: 'Stories, reels, posts - générés automatiquement pour chaque bien. Votre présence sociale sans effort.',
      Icon: Smartphone,
      highlight: 'Contenu illimité',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 49 : 39,
      description: 'Idéal pour débuter',
      features: [
        '3 plateformes connectées',
        '20 annonces actives',
        'Descriptions IA illimitées',
        'Support email',
        'Chatbot basique',
      ],
      cta: 'Commencer',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 99 : 79,
      description: 'Le choix des top agents',
      features: [
        '8 plateformes connectées',
        'Annonces illimitées',
        'Descriptions IA illimitées',
        'Chatbot avancé multilingue',
        'Séquences email/SMS',
        'Analyse de marché',
        'Support prioritaire',
      ],
      cta: 'Essai Gratuit 14 jours',
      highlighted: true,
    },
    {
      name: 'Agence',
      price: billingCycle === 'monthly' ? 249 : 199,
      description: 'Pour les équipes',
      features: [
        'Tout de Pro +',
        'Utilisateurs illimités',
        'API personnalisée',
        'Marque blanche',
        'Account manager dédié',
        'Formation équipe',
        'Intégrations sur mesure',
      ],
      cta: 'Contactez-nous',
      highlighted: false,
    },
  ];

  const testimonials = [
    {
      name: 'Marie-Claire Dubois',
      role: 'Agent IAD, Martinique',
      quote: 'CSX a transformé mon business. Je publie une fois, mes annonces sont partout. J\'ai doublé mes leads en 2 mois.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80',
    },
    {
      name: 'Thomas Bernard',
      role: 'Directeur Agence, Paris',
      quote: 'L\'IA génère des descriptions parfaites. Mes agents économisent 2h par jour. ROI immédiat.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    },
    {
      name: 'Sophie Létang',
      role: 'Agent Indépendant, Guadeloupe',
      quote: 'Le chatbot répond aux clients même la nuit. Je ne rate plus aucune opportunité. Indispensable.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    },
  ];

  const stats = [
    { value: '2,500+', label: 'Agents actifs', Icon: Users },
    { value: '150K+', label: 'Annonces publiées', Icon: Building2 },
    { value: '98%', label: 'Satisfaction client', Icon: Star },
    { value: '24/7', label: 'Support disponible', Icon: Clock },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
      color: '#ffffff',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-in {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
        .delay-5 { animation-delay: 0.5s; opacity: 0; }
        
        .gold-gradient {
          background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-4px);
        }
        
        .cta-button {
          background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
          color: #0a0a0f;
          border: none;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .cta-button:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.3);
        }
        
        .cta-secondary {
          background: transparent;
          color: #d4af37;
          border: 2px solid #d4af37;
          padding: 14px 30px;
        }
        
        .cta-secondary:hover {
          background: rgba(212, 175, 55, 0.1);
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.15);
        }
        
        .platform-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: default;
        }
        
        .platform-pill:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.3);
          transform: scale(1.05);
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        
        .nav-link:hover {
          color: #d4af37;
        }
        
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 24px;
        }
        
        .feature-card {
          padding: 28px;
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: all 0.3s ease;
          border-radius: 0 16px 16px 0;
        }
        
        .feature-card:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        .feature-card.active {
          background: rgba(212, 175, 55, 0.05);
          border-left-color: #d4af37;
        }
        
        .pricing-card {
          padding: 40px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s ease;
        }
        
        .pricing-card.highlighted {
          background: linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%);
          border-color: rgba(212, 175, 55, 0.3);
          transform: scale(1.05);
          position: relative;
        }
        
        .pricing-card.highlighted::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #d4af37, #f4e4bc, #d4af37);
          border-radius: 24px 24px 0 0;
        }
        
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .toggle-option {
          padding: 12px 24px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .toggle-option.active {
          background: #d4af37;
          color: #0a0a0f;
        }
        
        .testimonial-card {
          padding: 36px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        
        .testimonial-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(212, 175, 55, 0.2);
        }
        
        .footer-link {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
          cursor: pointer;
        }
        
        .footer-link:hover {
          color: #d4af37;
        }

        .stat-card {
          text-align: center;
          padding: 32px;
        }

        .feature-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 20px;
          transition: transform 0.5s ease;
        }

        .feature-image-container:hover .feature-image {
          transform: scale(1.05);
        }

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(212, 175, 55, 0.3);
        }
      `}</style>

      {/* Ambient Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
          animation: 'pulse 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          animation: 'pulse 10s ease-in-out infinite',
          animationDelay: '2s',
        }} />
      </div>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: '#0a0a0f',
            fontSize: '20px',
            fontFamily: '"Playfair Display", serif',
          }}>C</div>
          <div>
            <span style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '24px',
              fontWeight: '600',
              letterSpacing: '-0.5px',
            }}>CSX</span>
            <span style={{
              display: 'block',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: '600',
              letterSpacing: '2px',
              marginTop: '-2px',
            }}>IMMOBILIER</span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
        }}>
          <span className="nav-link">Fonctionnalités</span>
          <span className="nav-link">Tarifs</span>
          <span className="nav-link">Témoignages</span>
          <Link to="/login" className="nav-link">Connexion</Link>
          <Link to="/signup" className="cta-button" style={{ padding: '12px 24px', fontSize: '13px', textDecoration: 'none' }}>
            Essai Gratuit
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 48px 100px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1300px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}>
          <div>
            <div className={`animate-in ${isVisible ? '' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
              <span className="section-label">
                <Zap size={14} />
                Nouvelle Génération Immobilière
              </span>
            </div>
            
            <h1 className="animate-in delay-1" style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(40px, 5vw, 64px)',
              fontWeight: '600',
              lineHeight: '1.15',
              marginBottom: '24px',
            }}>
              L'IA qui <span className="gold-gradient">révolutionne</span> votre immobilier
            </h1>
            
            <p className="animate-in delay-2" style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '40px',
              lineHeight: '1.8',
              maxWidth: '500px',
            }}>
              Publiez une fois, diffusez partout. Automatisez vos annonces, 
              qualifiez vos leads et boostez vos ventes avec l'intelligence artificielle.
            </p>
            
            <div className="animate-in delay-3" style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '48px',
            }}>
              <Link to="/signup" className="cta-button" style={{ textDecoration: 'none' }}>
                Démarrer Gratuitement
                <ArrowRight size={18} />
              </Link>
              <button className="cta-button cta-secondary">
                <Play size={18} fill="currentColor" />
                Voir la Démo
              </button>
            </div>
            
            <div className="animate-in delay-4" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              {platforms.slice(0, 6).map((platform, index) => (
                <div key={index} className="platform-pill">
                  <div style={{ color: platform.color }}>
                    <platform.Logo />
                  </div>
                  <span>{platform.name}</span>
                </div>
              ))}
              <div className="platform-pill" style={{ 
                background: 'rgba(212, 175, 55, 0.1)',
                borderColor: 'rgba(212, 175, 55, 0.2)',
              }}>
                <span style={{ color: '#d4af37' }}>+12 autres</span>
              </div>
            </div>
          </div>

          <div className="animate-in delay-5" style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}>
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                alt="Real estate dashboard"
                style={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                }}
              />
            </div>
            
            {/* Floating stats card left */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-40px',
              background: 'rgba(18, 18, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '16px',
              padding: '20px 28px',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <BarChart3 size={24} style={{ color: '#d4af37' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#d4af37' }}>+147%</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Leads générés</p>
                </div>
              </div>
            </div>
            
            {/* Floating stats card right */}
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '-30px',
              background: 'rgba(18, 18, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '16px',
              padding: '20px 28px',
              animation: 'float 5s ease-in-out infinite',
              animationDelay: '1s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Check size={24} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>5h</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Gagnées / semaine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '60px 48px',
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
        }}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <stat.Icon size={28} style={{ color: '#d4af37' }} />
              </div>
              <p style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '40px',
                fontWeight: '700',
                marginBottom: '8px',
              }}>{stat.value}</p>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: '500',
              }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '120px 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1300px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="section-label">
              <Sparkles size={14} />
              Fonctionnalités
            </span>
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '48px',
              fontWeight: '600',
              marginBottom: '20px',
            }}>
              Tout ce dont vous avez <span className="gold-gradient">besoin</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: '550px',
              margin: '0 auto',
              lineHeight: '1.7',
            }}>
              Une suite complète d'outils IA conçus pour les professionnels de l'immobilier en France et aux Antilles
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '60px',
            alignItems: 'start',
          }}>
            <div className="glass-card" style={{ overflow: 'hidden', padding: '8px' }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: activeFeature === index ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                    }}>
                      <feature.Icon size={22} style={{ 
                        color: activeFeature === index ? '#d4af37' : 'rgba(255, 255, 255, 0.6)',
                        transition: 'color 0.3s ease',
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        {feature.title}
                        {activeFeature === index && (
                          <ChevronRight size={16} style={{ color: '#d4af37' }} />
                        )}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        lineHeight: '1.6',
                      }}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              position: 'sticky',
              top: '120px',
            }}>
              <div className="glass-card feature-image-container" style={{
                overflow: 'hidden',
                position: 'relative',
              }}>
                <img 
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  className="feature-image"
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '40px',
                  background: 'linear-gradient(0deg, rgba(10, 10, 15, 0.95) 0%, transparent 100%)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {React.createElement(features[activeFeature].Icon, { size: 28, style: { color: '#d4af37' } })}
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '28px',
                        fontWeight: '600',
                      }}>{features[activeFeature].title}</h3>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    borderRadius: '100px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#d4af37',
                    }}>{features[activeFeature].highlight}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '120px 48px',
        background: 'rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <span className="section-label">
            <Zap size={14} />
            Comment ça marche
          </span>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '48px',
            fontWeight: '600',
            marginBottom: '80px',
          }}>
            Simple comme <span className="gold-gradient">1, 2, 3</span>
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
          }}>
            {[
              { step: '01', title: 'Connectez', desc: 'Liez vos comptes (Facebook, Airbnb, SeLoger...) en quelques clics sécurisés.', Icon: Link2 },
              { step: '02', title: 'Créez', desc: 'Uploadez vos photos, l\'IA génère descriptions et contenus automatiquement.', Icon: Sparkles },
              { step: '03', title: 'Publiez', desc: 'Un clic, votre annonce est live sur toutes les plateformes simultanément.', Icon: Globe },
            ].map((item, index) => (
              <div key={index} className="glass-card" style={{ padding: '48px 36px', textAlign: 'center' }}>
                <div style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '72px',
                  fontWeight: '700',
                  color: 'rgba(212, 175, 55, 0.2)',
                  marginBottom: '24px',
                  lineHeight: '1',
                }}>{item.step}</div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <item.Icon size={28} style={{ color: '#d4af37' }} />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '16px',
                }}>{item.title}</h3>
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: '1.7',
                }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '120px 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-label">
              <Star size={14} />
              Tarifs
            </span>
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '48px',
              fontWeight: '600',
              marginBottom: '20px',
            }}>
              Investissez dans votre <span className="gold-gradient">succès</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '40px',
            }}>
              Sans engagement. Annulez à tout moment.
            </p>
            
            <div className="toggle-switch" style={{ display: 'inline-flex' }}>
              <div
                className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >Mensuel</div>
              <div
                className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Annuel
                <span style={{
                  marginLeft: '8px',
                  padding: '4px 10px',
                  background: billingCycle === 'yearly' ? 'rgba(0,0,0,0.2)' : 'rgba(212, 175, 55, 0.2)',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}>-20%</span>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            alignItems: 'center',
          }}>
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}>
                {plan.highlighted && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#d4af37',
                    color: '#0a0a0f',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginBottom: '20px',
                  }}>
                    <Star size={14} fill="currentColor" />
                    POPULAIRE
                  </div>
                )}
                <h3 style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '28px',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}>{plan.name}</h3>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '28px',
                }}>{plan.description}</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: '36px',
                }}>
                  <span style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '56px',
                    fontWeight: '700',
                  }}>{plan.price}</span>
                  <span style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>€/mois</span>
                </div>
                <ul style={{
                  listStyle: 'none',
                  marginBottom: '36px',
                }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}>
                      <Check size={18} style={{ color: '#d4af37', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Agence' ? '/signup?plan=agence' : `/signup?plan=${plan.name.toLowerCase()}`}
                  className={`cta-button ${!plan.highlighted ? 'cta-secondary' : ''}`}
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: '120px 48px',
        background: 'rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="section-label">
              <Users size={14} />
              Témoignages
            </span>
            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: '48px',
              fontWeight: '600',
            }}>
              Ils nous font <span className="gold-gradient">confiance</span>
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '28px',
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <Quote size={32} style={{ color: 'rgba(212, 175, 55, 0.3)', marginBottom: '20px' }} />
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '28px',
                }}>"{testimonial.quote}"</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="avatar"
                  />
                  <div>
                    <p style={{
                      fontWeight: '600',
                      marginBottom: '4px',
                      fontSize: '15px',
                    }}>{testimonial.name}</p>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '140px 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '56px',
            fontWeight: '600',
            marginBottom: '24px',
            lineHeight: '1.2',
          }}>
            Prêt à <span className="gold-gradient">transformer</span>
            <br />votre business ?
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '48px',
            maxWidth: '550px',
            margin: '0 auto 48px',
            lineHeight: '1.7',
          }}>
            Rejoignez +2,500 agents qui automatisent déjà leur immobilier avec CSX.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '32px',
          }}>
            <Link to="/signup" className="cta-button" style={{ fontSize: '16px', padding: '20px 40px', textDecoration: 'none' }}>
              Essai Gratuit 14 Jours
              <ArrowRight size={20} />
            </Link>
            <button className="cta-button cta-secondary" style={{ fontSize: '16px', padding: '18px 38px' }}>
              Réserver une Démo
            </button>
          </div>
          <div style={{
            display: 'flex',
            gap: '32px',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} style={{ color: '#22c55e' }} />
              Sans carte bancaire
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} style={{ color: '#22c55e' }} />
              Configuration en 5 min
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} style={{ color: '#22c55e' }} />
              Support inclus
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '80px 48px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '60px',
            marginBottom: '80px',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8962e 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#0a0a0f',
                  fontSize: '18px',
                  fontFamily: '"Playfair Display", serif',
                }}>C</div>
                <span style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '22px',
                  fontWeight: '600',
                }}>CSX</span>
              </div>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: '1.8',
                maxWidth: '300px',
                marginBottom: '24px',
              }}>
                L'automatisation immobilière nouvelle génération pour les agents en France et aux Antilles.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
              }}>
                {[PlatformLogos.Facebook, PlatformLogos.Instagram].map((Logo, index) => (
                  <div key={index} style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    <Logo />
                  </div>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Produit', links: ['Fonctionnalités', 'Tarifs', 'Intégrations', 'API'] },
              { title: 'Ressources', links: ['Documentation', 'Blog', 'Tutoriels', 'Webinaires'] },
              { title: 'Entreprise', links: ['À propos', 'Carrières', 'Presse', 'Contact'] },
              { title: 'Légal', links: ['CGU', 'Confidentialité', 'RGPD', 'Mentions légales'] },
            ].map((section, index) => (
              <div key={index}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}>{section.title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {section.links.map((link, idx) => (
                    <li key={idx} style={{ marginBottom: '14px' }}>
                      <span className="footer-link">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}>
              © 2025 CSX Immobilier. Tous droits réservés.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '13px',
            }}>
              <Shield size={14} />
              Données sécurisées et hébergées en France
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CSXLanding;
