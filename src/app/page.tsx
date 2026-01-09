'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Bell, PenLine, LayoutDashboard, Zap,
  ArrowRight, ChevronDown, Play, CheckCircle2, Menu, X,
  Mail, MessageSquare, Clock, Users, Quote
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">CSX Estate</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#probleme" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Problème</a>
              <a href="#fonctionnalites" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Fonctionnalités</a>
              <a href="#tarifs" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Tarifs</a>
              <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
                Connexion
              </Link>
              <Link 
                href="/login" 
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Essai gratuit
              </Link>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#probleme" className="block text-slate-600 hover:text-slate-900 py-2">Problème</a>
              <a href="#fonctionnalites" className="block text-slate-600 hover:text-slate-900 py-2">Fonctionnalités</a>
              <a href="#tarifs" className="block text-slate-600 hover:text-slate-900 py-2">Tarifs</a>
              <a href="#faq" className="block text-slate-600 hover:text-slate-900 py-2">FAQ</a>
              <Link href="/login" className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium">
                Essai gratuit 7 jours
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 lg:pt-36 pb-16 lg:pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 mb-6">
              Signez plus de mandats.{' '}
              <span className="text-blue-600">N&apos;oubliez plus aucun suivi.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              CSX Estate est l&apos;assistant IA des agents immobiliers qui vous dit qui relancer aujourd&apos;hui 
              et rédige le message pour vous — pour que plus aucun dossier ne meure à cause du silence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
              >
                Essai gratuit 7 jours
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Voir la démo (30s)
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Annulation à tout moment
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                10 minutes pour démarrer
              </span>
            </div>
          </div>

          {/* App Preview */}
          <div className="mt-16 lg:mt-20">
            <div className="relative max-w-4xl mx-auto">
              {/* Shadow/glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-transparent rounded-2xl blur-3xl opacity-50" />
              
              {/* Browser mockup */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full max-w-xs mx-auto px-4 py-1.5 bg-white rounded-md text-xs text-slate-400 text-center border border-slate-200">
                      app.csx-estate.com
                    </div>
                  </div>
                </div>
                
                {/* App content */}
                <div className="p-6 lg:p-8 bg-slate-50">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Bonjour, Agent 👋</h3>
                    <p className="text-slate-500">Vous avez 6 relances à faire aujourd&apos;hui</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-900">12</div>
                      <div className="text-sm text-slate-500">Dossiers actifs</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-2xl lg:text-3xl font-bold text-red-500">3</div>
                      <div className="text-sm text-slate-500">En retard</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-2xl lg:text-3xl font-bold text-emerald-500">24</div>
                      <div className="text-sm text-slate-500">Messages envoyés</div>
                    </div>
                  </div>

                  {/* Deal cards */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-xl p-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium">MD</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">Marie Dupont</div>
                        <div className="text-sm text-slate-500 truncate">15 Rue de la Paix, Paris</div>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">3j en retard</span>
                    </div>
                    <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-medium">LM</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">Lucas Moreau</div>
                        <div className="text-sm text-slate-500 truncate">23 Rue du Commerce, Paris</div>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-600 text-sm font-medium rounded-full">Aujourd&apos;hui</span>
                    </div>
                    <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-medium">PB</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">Pierre Bonnet</div>
                        <div className="text-sm text-slate-500 truncate">91 Avenue Foch, Paris</div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-sm font-medium rounded-full">Demain</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-slate-500">
            Utilisé par des agents immobiliers qui ne veulent plus perdre de ventes à cause d&apos;un suivi oublié.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section id="probleme" className="py-20 lg:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Les ventes n&apos;échouent pas à cause du prix.<br />
              <span className="text-red-500">Elles échouent à cause du silence.</span>
            </h2>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 lg:p-10 mb-12">
            <p className="text-lg text-slate-600 mb-6 font-medium">Tous les agents connaissent cette situation :</p>
            <div className="space-y-4">
              {[
                'Vous vouliez relancer… mais la journée a débordé',
                'Le client a oublié d\'envoyer ses documents',
                'La banque n\'a pas répondu',
                'Le vendeur a trop attendu',
                'L\'acheteur a perdu confiance',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-900 font-medium text-lg">
                Et soudain… le dossier tombe à l&apos;eau.
              </p>
              <p className="text-slate-500 mt-2">
                Pas parce que vous étiez mauvais. Mais parce que personne n&apos;a relancé au bon moment.
              </p>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-blue-600 rounded-2xl p-8 lg:p-10 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              CSX Estate est votre pilote automatique du suivi client.
            </h3>
            <p className="text-blue-100 mb-6">
              Il ne remplace pas votre CRM. Il ne change pas vos habitudes.
            </p>
            <p className="text-white font-medium mb-4">Il s&apos;assure simplement que :</p>
            <div className="space-y-3">
              {[
                'Aucun dossier n\'est oublié',
                'Aucun client n\'est laissé sans réponse',
                'Aucune opportunité ne disparaît dans le silence',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 lg:py-28 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Comment ça marche</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: '1',
                title: 'Ajoutez vos dossiers',
                description: '30 secondes par dossier. Import CSV disponible.',
                icon: LayoutDashboard,
              },
              {
                step: '2',
                title: 'Ouvrez CSX Estate chaque matin',
                description: 'Voyez qui relancer aujourd\'hui en un coup d\'œil.',
                icon: Clock,
              },
              {
                step: '3',
                title: 'Envoyez le message généré',
                description: 'Email ou WhatsApp. Professionnel. Humain. Prêt à envoyer.',
                icon: Mail,
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Fonctionnalités</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: Bell,
                title: 'Rappels intelligents',
                description: 'Vous savez toujours qui relancer. Plus jamais de client oublié.',
                color: 'bg-amber-100 text-amber-600',
              },
              {
                icon: PenLine,
                title: 'Messages adaptés à l\'immobilier',
                description: 'Pas de texte IA générique. Des messages qui sonnent comme vous.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: LayoutDashboard,
                title: 'Tableau de bord simple',
                description: 'Pas de CRM compliqué. Juste les priorités du jour.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Zap,
                title: 'Mise en place en 10 minutes',
                description: 'Pas de formation. Pas de prise de tête. Vous êtes prêt.',
                color: 'bg-emerald-100 text-emerald-600',
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-xl">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 lg:py-28 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Voir CSX Estate en action</h2>
            <p className="text-lg text-slate-600">30 secondes pour comprendre comment ça fonctionne</p>
          </div>

          {/* Video placeholder */}
          <div className="relative aspect-video bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden group cursor-pointer hover:border-blue-300 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 text-left">
              <div className="text-slate-400 text-sm mb-1">Démo produit</div>
              <div className="text-slate-700 font-medium">30 secondes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Ce qu&apos;en disent les agents</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: 'Je ne perds plus de ventes à cause des relances tardives.',
                name: 'Sophie',
                role: 'Agent immobilier',
              },
              {
                quote: 'On dirait un assistant qui n\'oublie jamais.',
                name: 'Marc',
                role: 'Directeur d\'agence',
              },
              {
                quote: 'Je gagne des heures chaque semaine.',
                name: 'Julien',
                role: 'Agent indépendant',
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-slate-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-medium">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 lg:py-28 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Une seule vente sauvée rembourse l&apos;année.
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Si CSX Estate vous permet de conclure une vente de plus par an, l&apos;outil est déjà rentabilisé.
          </p>
          <div className="inline-flex items-center gap-4 bg-white/10 rounded-xl px-6 py-4">
            <div className="text-left">
              <div className="text-3xl font-bold">79€ × 12 = 948€</div>
              <div className="text-blue-200">Coût annuel</div>
            </div>
            <div className="text-4xl">→</div>
            <div className="text-left">
              <div className="text-3xl font-bold text-emerald-300">5 000€ - 15 000€</div>
              <div className="text-blue-200">Commission moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Tarifs simples</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo Plan */}
            <div className="relative bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                Le plus populaire
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Agent Solo</h3>
                <p className="text-slate-500 text-sm">Tout ce qu&apos;il faut pour ne plus perdre de ventes</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-slate-900">79€</span>
                <span className="text-slate-500"> / mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Dossiers illimités',
                  'Messages IA illimités',
                  'Email + WhatsApp',
                  'Tableau de suivi intelligent',
                  'Essai gratuit 7 jours',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/login" 
                className="block w-full py-4 bg-blue-600 text-white font-semibold rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                Démarrer l&apos;essai gratuit
              </Link>
              <p className="text-center text-sm text-slate-400 mt-3">Sans carte bancaire</p>
            </div>

            {/* Agency Plan */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Agence</h3>
                <p className="text-slate-500 text-sm">Pour les équipes de 5+ agents</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-5xl font-bold text-slate-900">59€</span>
                <span className="text-slate-500"> / agent / mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Toutes les fonctions Solo',
                  'Minimum 5 agents',
                  'Facturation centralisée',
                  'Support prioritaire',
                  'Onboarding dédié',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="mailto:contact@csx-estate.com" 
                className="block w-full py-4 bg-white text-slate-700 font-semibold rounded-lg text-center border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Contacter l&apos;équipe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Est-ce que ça remplace mon CRM ?',
                a: 'Non. CSX Estate fonctionne à côté de votre CRM actuel. Il se concentre uniquement sur les relances.',
              },
              {
                q: 'Combien de temps pour commencer ?',
                a: 'Environ 10 minutes. Ajoutez quelques dossiers et vous êtes prêt.',
              },
              {
                q: 'Est-ce facile à utiliser ?',
                a: 'Si vous savez envoyer un email, vous savez utiliser CSX Estate. Pas de formation nécessaire.',
              },
              {
                q: 'Puis-je tester sans engagement ?',
                a: 'Oui. Essai gratuit 7 jours, sans carte bancaire. Annulation à tout moment.',
              },
            ].map((item, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-slate-900">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-slate-600">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ne perdez plus de ventes à cause du silence.
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Rejoignez les agents qui utilisent l&apos;IA pour ne plus jamais oublier un suivi.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            Démarrer l&apos;essai gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">Sans stress. Annulation à tout moment.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">CSX Estate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="mailto:contact@csx-estate.com" className="hover:text-slate-900 transition-colors">Contact</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-slate-900 transition-colors">CGV</a>
            </div>
          </div>
          <p className="text-center text-sm text-slate-400 mt-6">
            © {new Date().getFullYear()} CSX Estate. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
