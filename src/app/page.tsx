'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Bell, PenLine, LayoutDashboard, Zap,
  ArrowRight, ChevronDown, Play, CheckCircle2, Menu, X,
  Mail, Quote, Star, Globe
} from 'lucide-react';

type Lang = 'fr' | 'en';

const content = {
  fr: {
    nav: {
      problem: 'Problème',
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      faq: 'FAQ',
      login: 'Connexion',
      trial: 'Essai gratuit',
    },
    hero: {
      badge: 'Pour agents immobiliers',
      title1: 'Signez plus de mandats.',
      title2: 'N\'oubliez plus aucun suivi.',
      subtitle: 'L\'assistant IA qui vous dit qui relancer aujourd\'hui et rédige le message pour vous — pour que plus aucun dossier ne meure à cause du silence.',
      cta: 'Essai gratuit 7 jours',
      demo: 'Voir la démo (30s)',
      trust1: 'Sans carte bancaire',
      trust2: 'Annulation à tout moment',
      trust3: '10 min pour démarrer',
    },
    app: {
      greeting: 'Bonjour, Agent 👋',
      subtitle: 'Vous avez 6 relances à faire aujourd\'hui',
      stats: ['Dossiers actifs', 'En retard', 'Messages envoyés'],
      overdue: 'en retard',
      today: 'Aujourd\'hui',
      tomorrow: 'Demain',
    },
    trustStrip: 'Utilisé par des agents immobiliers qui ne veulent plus perdre de ventes à cause d\'un suivi oublié.',
    problem: {
      title1: 'Les ventes n\'échouent pas à cause du prix.',
      title2: 'Elles échouent à cause du silence.',
      intro: 'Tous les agents connaissent cette situation :',
      points: [
        'Vous vouliez relancer… mais la journée a débordé',
        'Le client a oublié d\'envoyer ses documents',
        'La banque n\'a pas répondu',
        'Le vendeur a trop attendu',
        'L\'acheteur a perdu confiance',
      ],
      conclusion1: 'Et soudain… le dossier tombe à l\'eau.',
      conclusion2: 'Pas parce que vous étiez mauvais. Mais parce que personne n\'a relancé au bon moment.',
    },
    solution: {
      title: 'CSX Estate est votre pilote automatique du suivi client.',
      subtitle: 'Il ne remplace pas votre CRM. Il ne change pas vos habitudes.',
      intro: 'Il s\'assure simplement que :',
      points: [
        'Aucun dossier n\'est oublié',
        'Aucun client n\'est laissé sans réponse',
        'Aucune opportunité ne disparaît dans le silence',
      ],
    },
    howItWorks: {
      title: 'Comment ça marche',
      steps: [
        { title: 'Ajoutez vos dossiers', desc: '30 secondes par dossier. Import CSV disponible.' },
        { title: 'Ouvrez CSX Estate chaque matin', desc: 'Voyez qui relancer aujourd\'hui en un coup d\'œil.' },
        { title: 'Envoyez le message généré', desc: 'Email ou WhatsApp. Professionnel. Humain. Prêt à envoyer.' },
      ],
    },
    features: {
      title: 'Fonctionnalités',
      list: [
        { title: 'Rappels intelligents', desc: 'Vous savez toujours qui relancer. Plus jamais de client oublié.' },
        { title: 'Messages adaptés à l\'immobilier', desc: 'Pas de texte IA générique. Des messages qui sonnent comme vous.' },
        { title: 'Tableau de bord simple', desc: 'Pas de CRM compliqué. Juste les priorités du jour.' },
        { title: 'Mise en place en 10 minutes', desc: 'Pas de formation. Pas de prise de tête. Vous êtes prêt.' },
      ],
    },
    demo: {
      title: 'Voir CSX Estate en action',
      subtitle: '30 secondes pour comprendre comment ça fonctionne',
      label: 'Démo produit',
      duration: '30 secondes',
    },
    testimonials: {
      title: 'Ce qu\'en disent les agents',
      list: [
        { quote: 'Je ne perds plus de ventes à cause des relances tardives.', name: 'Sophie', role: 'Agent immobilier' },
        { quote: 'On dirait un assistant qui n\'oublie jamais.', name: 'Marc', role: 'Directeur d\'agence' },
        { quote: 'Je gagne des heures chaque semaine.', name: 'Julien', role: 'Agent indépendant' },
      ],
    },
    roi: {
      title: 'Une seule vente sauvée rembourse l\'année.',
      subtitle: 'Si CSX Estate vous permet de conclure une vente de plus par an, l\'outil est déjà rentabilisé.',
      cost: 'Coût annuel',
      commission: 'Commission moyenne',
    },
    pricing: {
      title: 'Tarifs simples',
      solo: {
        badge: 'Le plus populaire',
        name: 'Agent Solo',
        desc: 'Tout ce qu\'il faut pour ne plus perdre de ventes',
        price: '79€',
        period: '/ mois',
        features: ['Dossiers illimités', 'Messages IA illimités', 'Email + WhatsApp', 'Tableau de suivi intelligent', 'Essai gratuit 7 jours'],
        cta: 'Démarrer l\'essai gratuit',
        note: 'Sans carte bancaire',
      },
      agency: {
        name: 'Agence',
        desc: 'Pour les équipes de 5+ agents',
        price: '59€',
        period: '/ agent / mois',
        features: ['Toutes les fonctions Solo', 'Minimum 5 agents', 'Facturation centralisée', 'Support prioritaire', 'Onboarding dédié'],
        cta: 'Contacter l\'équipe',
      },
    },
    faq: {
      title: 'Questions fréquentes',
      list: [
        { q: 'Est-ce que ça remplace mon CRM ?', a: 'Non. CSX Estate fonctionne à côté de votre CRM actuel. Il se concentre uniquement sur les relances.' },
        { q: 'Combien de temps pour commencer ?', a: 'Environ 10 minutes. Ajoutez quelques dossiers et vous êtes prêt.' },
        { q: 'Est-ce facile à utiliser ?', a: 'Si vous savez envoyer un email, vous savez utiliser CSX Estate. Pas de formation nécessaire.' },
        { q: 'Puis-je tester sans engagement ?', a: 'Oui. Essai gratuit 7 jours, sans carte bancaire. Annulation à tout moment.' },
      ],
    },
    finalCta: {
      title: 'Ne perdez plus de ventes à cause du silence.',
      subtitle: 'Rejoignez les agents qui utilisent l\'IA pour ne plus jamais oublier un suivi.',
      cta: 'Démarrer l\'essai gratuit',
      note: 'Sans stress. Annulation à tout moment.',
    },
    footer: {
      contact: 'Contact',
      privacy: 'Confidentialité',
      terms: 'CGV',
      rights: 'Tous droits réservés.',
    },
  },
  en: {
    nav: {
      problem: 'Problem',
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Sign In',
      trial: 'Free Trial',
    },
    hero: {
      badge: 'For Real Estate Agents',
      title1: 'Close more deals.',
      title2: 'Forget zero follow-ups.',
      subtitle: 'The AI assistant that tells you who to contact today and writes the follow-up for you — so deals never die from silence again.',
      cta: 'Start 7-Day Free Trial',
      demo: 'Watch Demo (30s)',
      trust1: 'No credit card required',
      trust2: 'Cancel anytime',
      trust3: '10 min setup',
    },
    app: {
      greeting: 'Good morning, Agent 👋',
      subtitle: 'You have 6 follow-ups due today',
      stats: ['Active Deals', 'Overdue', 'Messages Sent'],
      overdue: 'overdue',
      today: 'Today',
      tomorrow: 'Tomorrow',
    },
    trustStrip: 'Used by real estate agents who don\'t want to lose deals to forgotten follow-ups.',
    problem: {
      title1: 'Deals don\'t fail because of price.',
      title2: 'They fail because of silence.',
      intro: 'Every agent knows this:',
      points: [
        'You meant to follow up — but the day got busy',
        'The client forgot to send documents',
        'The bank didn\'t reply',
        'The seller waited too long',
        'The buyer lost confidence',
      ],
      conclusion1: 'And suddenly… the deal is gone.',
      conclusion2: 'Not because you weren\'t good. Because no one followed up at the right moment.',
    },
    solution: {
      title: 'CSX Estate is your follow-up autopilot.',
      subtitle: 'It doesn\'t replace your CRM. It doesn\'t change your workflow.',
      intro: 'It simply makes sure that:',
      points: [
        'No deal is forgotten',
        'No client is ignored',
        'No opportunity dies quietly',
      ],
    },
    howItWorks: {
      title: 'How it works',
      steps: [
        { title: 'Add your deals', desc: '30 seconds each. CSV import available.' },
        { title: 'Open CSX Estate every morning', desc: 'See who needs follow-up at a glance.' },
        { title: 'Send the AI-written message', desc: 'Email or WhatsApp. Professional. Human. Ready to send.' },
      ],
    },
    features: {
      title: 'Features',
      list: [
        { title: 'Smart reminders', desc: 'Never guess who to contact. Never forget a client.' },
        { title: 'Real-estate trained messages', desc: 'Not generic AI text. Messages that sound like you.' },
        { title: 'Simple daily dashboard', desc: 'No complex CRM. Just today\'s priorities.' },
        { title: '10-minute setup', desc: 'No training. No onboarding hell. You\'re ready.' },
      ],
    },
    demo: {
      title: 'See CSX Estate in action',
      subtitle: '30 seconds to understand how it works',
      label: 'Product Demo',
      duration: '30 seconds',
    },
    testimonials: {
      title: 'What agents are saying',
      list: [
        { quote: 'I stopped losing deals because of late follow-ups.', name: 'Sophie', role: 'Real Estate Agent' },
        { quote: 'Feels like having an assistant that never forgets.', name: 'Marc', role: 'Agency Owner' },
        { quote: 'Saved me hours every week.', name: 'Julien', role: 'Independent Agent' },
      ],
    },
    roi: {
      title: 'One saved deal pays for the year.',
      subtitle: 'If CSX Estate helps you close just one extra deal per year, it already paid for itself.',
      cost: 'Annual cost',
      commission: 'Average commission',
    },
    pricing: {
      title: 'Simple pricing',
      solo: {
        badge: 'Most Popular',
        name: 'Solo Agent',
        desc: 'Everything you need to stop losing deals',
        price: '€79',
        period: '/ month',
        features: ['Unlimited deals', 'Unlimited AI messages', 'Email + WhatsApp', 'Smart follow-up dashboard', '7-day free trial'],
        cta: 'Start Free Trial',
        note: 'No credit card required',
      },
      agency: {
        name: 'Agency',
        desc: 'For teams of 5+ agents',
        price: '€59',
        period: '/ agent / month',
        features: ['Everything in Solo', 'Minimum 5 agents', 'Centralized billing', 'Priority support', 'Dedicated onboarding'],
        cta: 'Contact Sales',
      },
    },
    faq: {
      title: 'Frequently Asked Questions',
      list: [
        { q: 'Does this replace my CRM?', a: 'No. CSX Estate works alongside your current CRM. It focuses only on follow-ups.' },
        { q: 'How long to set up?', a: 'About 10 minutes. Add a few deals and you\'re ready.' },
        { q: 'Is it easy to use?', a: 'If you can send an email, you can use CSX Estate. No training required.' },
        { q: 'Can I try without commitment?', a: 'Yes. 7-day free trial, no credit card. Cancel anytime.' },
      ],
    },
    finalCta: {
      title: 'Stop losing deals to silence.',
      subtitle: 'Join agents who use AI to never miss a follow-up.',
      cta: 'Start Your Free Trial',
      note: 'No stress. Cancel anytime.',
    },
    footer: {
      contact: 'Contact',
      privacy: 'Privacy',
      terms: 'Terms',
      rights: 'All rights reserved.',
    },
  },
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Lang>('fr');

  const t = content[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featureIcons = [Bell, PenLine, LayoutDashboard, Zap];

  return (
    <div className="min-h-screen bg-[#0B1121] text-white">
      {/* Gradient overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0B1121]/90 backdrop-blur-xl border-b border-white/5' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">CSX Estate</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#probleme" className="text-sm text-white/60 hover:text-white transition-colors">{t.nav.problem}</a>
              <a href="#fonctionnalites" className="text-sm text-white/60 hover:text-white transition-colors">{t.nav.features}</a>
              <a href="#tarifs" className="text-sm text-white/60 hover:text-white transition-colors">{t.nav.pricing}</a>
              <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">{t.nav.faq}</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Language Toggle */}
              <button 
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
                {lang.toUpperCase()}
              </button>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
                {t.nav.login}
              </Link>
              <Link 
                href="/login" 
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
              >
                {t.nav.trial}
              </Link>
            </div>

            <button 
              className="md:hidden p-2 text-white/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B1121]/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              <a href="#probleme" className="block text-white/60 hover:text-white py-2">{t.nav.problem}</a>
              <a href="#fonctionnalites" className="block text-white/60 hover:text-white py-2">{t.nav.features}</a>
              <a href="#tarifs" className="block text-white/60 hover:text-white py-2">{t.nav.pricing}</a>
              <a href="#faq" className="block text-white/60 hover:text-white py-2">{t.nav.faq}</a>
              <button 
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-2 text-white/60 py-2"
              >
                <Globe className="w-4 h-4" />
                {lang === 'fr' ? 'English' : 'Français'}
              </button>
              <Link href="/login" className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium mt-4">
                {t.hero.cta}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 lg:pt-32 pb-8 lg:pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
                <Star className="w-4 h-4" />
                <span>{t.hero.badge}</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] mb-6">
                {t.hero.title1}{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {t.hero.title2}
                </span>
              </h1>

              <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-6">
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  {t.hero.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#demo" 
                  className="w-full sm:w-auto px-7 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {t.hero.demo}
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-white/40">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {t.hero.trust1}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {t.hero.trust2}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {t.hero.trust3}
                </span>
              </div>
            </div>

            {/* Right: App Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 p-1.5 backdrop-blur-sm">
                <div className="bg-[#0F172A] rounded-xl overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full max-w-[200px] mx-auto px-3 py-1 bg-white/5 rounded text-xs text-white/30 text-center">
                        app.csx-estate.com
                      </div>
                    </div>
                  </div>
                  
                  {/* App content */}
                  <div className="p-4 lg:p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-0.5">{t.app.greeting}</h3>
                      <p className="text-white/40 text-sm">{t.app.subtitle}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="text-xl lg:text-2xl font-bold text-white">12</div>
                        <div className="text-xs text-white/40">{t.app.stats[0]}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="text-xl lg:text-2xl font-bold text-red-400">3</div>
                        <div className="text-xs text-white/40">{t.app.stats[1]}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="text-xl lg:text-2xl font-bold text-emerald-400">24</div>
                        <div className="text-xs text-white/40">{t.app.stats[2]}</div>
                      </div>
                    </div>

                    {/* Deal cards */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-sm font-medium">MD</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm">Marie Dupont</div>
                          <div className="text-xs text-white/40 truncate">15 Rue de la Paix, Paris</div>
                        </div>
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full whitespace-nowrap">3j {t.app.overdue}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm font-medium">LM</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm">Lucas Moreau</div>
                          <div className="text-xs text-white/40 truncate">23 Rue du Commerce, Paris</div>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">{t.app.today}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-medium">PB</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm">Pierre Bonnet</div>
                          <div className="text-xs text-white/40 truncate">91 Avenue Foch, Paris</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">{t.app.tomorrow}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -left-3 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Message envoyé !' : 'Message sent!'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-white/40 text-sm">
            {t.trustStrip}
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section id="probleme" className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">
              {t.problem.title1}
            </h2>
            <h2 className="text-3xl lg:text-4xl font-bold text-red-400">
              {t.problem.title2}
            </h2>
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 lg:p-8 mb-8">
            <p className="text-lg text-white/60 mb-6 font-medium">{t.problem.intro}</p>
            <div className="space-y-3">
              {t.problem.points.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-white/70">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white font-medium text-lg">{t.problem.conclusion1}</p>
              <p className="text-white/50 mt-2">{t.problem.conclusion2}</p>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8">
            <h3 className="text-2xl lg:text-3xl font-bold mb-3">{t.solution.title}</h3>
            <p className="text-blue-100 mb-6">{t.solution.subtitle}</p>
            <p className="text-white font-medium mb-4">{t.solution.intro}</p>
            <div className="space-y-3">
              {t.solution.points.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span className="text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">{t.howItWorks.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.howItWorks.steps.map((step, i) => (
              <div key={i} className="relative bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/25">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">{t.features.title}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {t.features.list.map((feature, i) => {
              const Icon = featureIcons[i];
              const colors = ['bg-amber-500/20 text-amber-400', 'bg-purple-500/20 text-purple-400', 'bg-blue-500/20 text-blue-400', 'bg-emerald-500/20 text-emerald-400'];
              return (
                <div key={i} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <div className={`w-12 h-12 ${colors[i]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/50 text-sm">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.demo.title}</h2>
            <p className="text-lg text-white/50">{t.demo.subtitle}</p>
          </div>
          <div className="relative aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6">
              <div className="text-white/40 text-sm mb-1">{t.demo.label}</div>
              <div className="text-white font-medium">{t.demo.duration}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">{t.testimonials.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.testimonials.list.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Quote className="w-8 h-8 text-blue-500/30 mb-4" />
                <p className="text-white/80 mb-6 italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-sm text-white/40">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.roi.title}</h2>
            <p className="text-xl text-blue-100 mb-8">{t.roi.subtitle}</p>
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 rounded-xl px-6 py-4">
              <div className="text-left">
                <div className="text-2xl lg:text-3xl font-bold">79€ × 12 = 948€</div>
                <div className="text-blue-200">{t.roi.cost}</div>
              </div>
              <div className="text-3xl hidden sm:block">→</div>
              <div className="text-left">
                <div className="text-2xl lg:text-3xl font-bold text-emerald-300">5 000€ - 15 000€</div>
                <div className="text-blue-200">{t.roi.commission}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">{t.pricing.title}</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo */}
            <div className="relative bg-gradient-to-b from-blue-500/10 to-transparent rounded-2xl border-2 border-blue-500/30 p-6 lg:p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                {t.pricing.solo.badge}
              </div>
              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-bold text-white mb-1">{t.pricing.solo.name}</h3>
                <p className="text-white/50 text-sm">{t.pricing.solo.desc}</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-white">{t.pricing.solo.price}</span>
                <span className="text-white/50">{t.pricing.solo.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.pricing.solo.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block w-full py-4 bg-blue-600 text-white font-semibold rounded-lg text-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25">
                {t.pricing.solo.cta}
              </Link>
              <p className="text-center text-sm text-white/40 mt-3">{t.pricing.solo.note}</p>
            </div>

            {/* Agency */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 lg:p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{t.pricing.agency.name}</h3>
                <p className="text-white/50 text-sm">{t.pricing.agency.desc}</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-white">{t.pricing.agency.price}</span>
                <span className="text-white/50">{t.pricing.agency.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.pricing.agency.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-white/30 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:contact@csx-estate.com" className="block w-full py-4 bg-white/10 border border-white/10 text-white font-semibold rounded-lg text-center hover:bg-white/20 transition-colors">
                {t.pricing.agency.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">{t.faq.title}</h2>
          <div className="space-y-4">
            {t.faq.list.map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-white pr-4">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-white/40 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-white/60">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t.finalCta.title}</h2>
          <p className="text-lg text-white/60 mb-8">{t.finalCta.subtitle}</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25">
            {t.finalCta.cta}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-white/40 mt-4">{t.finalCta.note}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">CSX Estate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="mailto:contact@csx-estate.com" className="hover:text-white transition-colors">{t.footer.contact}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
            </div>
          </div>
          <p className="text-center text-sm text-white/30 mt-6">
            © {new Date().getFullYear()} CSX Estate. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
