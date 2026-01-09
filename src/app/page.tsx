'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, Sparkles, Clock, MessageSquare, BarChart3, 
  Zap, Shield, Check, ArrowRight, ChevronDown, Play,
  Mail, Target, CheckCircle2, ArrowUpRight, Menu, X
} from 'lucide-react';

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: 15, suffix: '', label: 'Deal stages covered' },
    { value: 10, suffix: 's', label: 'To generate a message' },
    { value: 5, suffix: 'x', label: 'Faster follow-ups' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-sm opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-bold text-xl">CSX Estate</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-sm text-white/60 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="group relative px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                <span className="relative z-10">Start Free Trial</span>
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
          <div className="md:hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-white/60 hover:text-white">Features</a>
              <a href="#demo" className="block text-white/60 hover:text-white">Demo</a>
              <a href="#pricing" className="block text-white/60 hover:text-white">Pricing</a>
              <a href="#faq" className="block text-white/60 hover:text-white">FAQ</a>
              <Link href="/login" className="block w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-center rounded-full font-medium">
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white/80">AI-Powered CRM for Real Estate</span>
              <ArrowUpRight className="w-4 h-4 text-white/40" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8">
              Stop losing deals to{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  forgotten follow-ups
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#3B82F6"/>
                      <stop offset="0.5" stopColor="#06B6D4"/>
                      <stop offset="1" stopColor="#3B82F6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              The average agent loses 3-5 deals per year from poor follow-up timing. 
              Our AI tells you who to contact and writes the message for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                href="/login" 
                className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full overflow-hidden transition-all hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start 7-Day Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <a 
                href="#demo" 
                className="group w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                GDPR compliant
              </span>
            </div>
          </div>

          {/* Hero Image/App Preview */}
          <div className="relative mt-20">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
            
            {/* App preview container */}
            <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-white/10 p-2 backdrop-blur-sm">
              <div className="bg-[#12121A] rounded-2xl overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A24] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full max-w-md mx-auto px-4 py-1.5 bg-white/5 rounded-lg text-xs text-white/40 text-center">
                      app.csx-estate.com
                    </div>
                  </div>
                </div>
                
                {/* App screenshot */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
                  {/* Dashboard mockup */}
                  <div className="absolute inset-0 p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">Good morning, Agent</h3>
                      <p className="text-white/50 text-sm lg:text-base">You have 6 follow-ups that need attention</p>
                    </div>
                    
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
                      <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/10">
                        <div className="text-2xl lg:text-3xl font-bold text-white">12</div>
                        <div className="text-xs lg:text-sm text-white/50">Active Deals</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/10">
                        <div className="text-2xl lg:text-3xl font-bold text-red-400">3</div>
                        <div className="text-xs lg:text-sm text-white/50">Overdue</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/10">
                        <div className="text-2xl lg:text-3xl font-bold text-emerald-400">24</div>
                        <div className="text-xs lg:text-sm text-white/50">Messages Sent</div>
                      </div>
                    </div>

                    {/* Deal cards */}
                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center gap-3 lg:gap-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 lg:p-4">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-sm lg:text-base font-medium">M</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm lg:text-base truncate">Marie Dupont</div>
                          <div className="text-xs lg:text-sm text-white/50 truncate">15 Rue de la Paix, Paris</div>
                        </div>
                        <span className="px-2 lg:px-3 py-1 bg-red-500/20 text-red-400 text-xs lg:text-sm rounded-full whitespace-nowrap">3d overdue</span>
                      </div>
                      <div className="flex items-center gap-3 lg:gap-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 lg:p-4">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm lg:text-base font-medium">L</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm lg:text-base truncate">Lucas Moreau</div>
                          <div className="text-xs lg:text-sm text-white/50 truncate">23 Rue du Commerce, Paris</div>
                        </div>
                        <span className="px-2 lg:px-3 py-1 bg-amber-500/20 text-amber-400 text-xs lg:text-sm rounded-full whitespace-nowrap">Due today</span>
                      </div>
                      <div className="flex items-center gap-3 lg:gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 lg:p-4">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm lg:text-base font-medium">P</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white text-sm lg:text-base truncate">Pierre Bonnet</div>
                          <div className="text-xs lg:text-sm text-white/50 truncate">91 Avenue Foch, Paris</div>
                        </div>
                        <span className="px-2 lg:px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs lg:text-sm rounded-full whitespace-nowrap">1d left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 px-3 lg:px-4 py-2 lg:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl lg:rounded-2xl shadow-xl shadow-emerald-500/25 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                <span className="text-xs lg:text-sm font-medium text-white">Message sent!</span>
              </div>
            </div>

            <div className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 px-3 lg:px-4 py-2 lg:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl lg:rounded-2xl shadow-xl shadow-blue-500/25 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                <span className="text-xs lg:text-sm font-medium text-white">AI generated in 3s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos/Trust Section */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-white/40 mb-8">Built for professionals who value their time</p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-40">
            <div className="text-xl lg:text-2xl font-bold">FNAIM</div>
            <div className="text-xl lg:text-2xl font-bold">Century 21</div>
            <div className="text-xl lg:text-2xl font-bold">ERA</div>
            <div className="text-xl lg:text-2xl font-bold">ORPI</div>
            <div className="text-xl lg:text-2xl font-bold hidden md:block">Laforêt</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, i) => {
              const { count, ref } = useCounter(stat.value);
              return (
                <div key={i} ref={ref} className="text-center">
                  <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {count}{stat.suffix}
                  </div>
                  <div className="text-white/60">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                The real cost of{' '}
                <span className="text-red-400">forgotten follow-ups</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '😰', text: 'Leads go cold because you forgot to call back' },
                  { icon: '⏰', text: 'You spend 30+ minutes writing the same emails' },
                  { icon: '📊', text: 'Deals slip through the cracks in spreadsheets' },
                  { icon: '❓', text: 'No idea who needs attention today' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                With CSX Estate,{' '}
                <span className="text-emerald-400">you stay ahead</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '✅', text: 'Never miss a follow-up with smart reminders' },
                  { icon: '⚡', text: 'AI writes personalized messages in seconds' },
                  { icon: '📈', text: 'Visual pipeline shows every deal at a glance' },
                  { icon: '📧', text: 'Daily email tells you exactly what to do' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-white/80">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">close more deals</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/60 max-w-2xl mx-auto">
              Built specifically for real estate agents. No bloated features, just what actually helps you close.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Message Generation',
                description: 'One click generates the perfect follow-up based on deal stage. Email or WhatsApp, friendly or firm.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Clock,
                title: 'Smart Reminders',
                description: 'Each deal stage has optimal follow-up timing. Get notified before leads go cold.',
                color: 'from-amber-500 to-orange-500',
              },
              {
                icon: Target,
                title: 'Visual Pipeline',
                description: 'Drag and drop deals through 15 stages. From first contact to closing, always know where you stand.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Mail,
                title: 'Daily Digest',
                description: 'Every morning, get an email with exactly who needs your attention. No more guessing.',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track your pipeline health, conversion rates, and follow-up performance at a glance.',
                color: 'from-rose-500 to-red-500',
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Your data is encrypted and isolated. GDPR compliant. We never share or sell your information.',
                color: 'from-indigo-500 to-violet-500',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">See it in action</h2>
            <p className="text-lg lg:text-xl text-white/60">Watch how CSX Estate helps you stay on top of every deal</p>
          </div>

          {/* Video placeholder */}
          <div className="relative aspect-video bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 lg:w-8 lg:h-8 text-[#0A0A0F] ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 text-left">
              <div className="text-white/60 text-xs lg:text-sm mb-1">Product Demo</div>
              <div className="text-white font-semibold text-sm lg:text-base">2 min walkthrough</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Start closing more deals in 3 steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add your deals',
                description: 'Import via CSV or add manually. Takes 2 minutes to get started.',
              },
              {
                step: '2',
                title: 'Check your dashboard',
                description: 'Every morning, see exactly who needs follow-up. No more guessing.',
              },
              {
                step: '3',
                title: 'Send AI messages',
                description: 'Click generate, review, and send. 10 minutes of work in 10 seconds.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl lg:text-8xl font-bold text-white/5 absolute -top-6 lg:-top-8 -left-2 lg:-left-4">{item.step}</div>
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-lg lg:text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Simple pricing.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Serious results.</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/60">
              If this saves you just one deal per year, it pays for itself 10x over.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo Plan */}
            <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl border border-white/20 p-6 lg:p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-full mb-4">
                  MOST POPULAR
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Solo Agent</h3>
                <p className="text-white/60 mb-6">Everything you need to close more deals</p>
                <div className="mb-6">
                  <span className="text-4xl lg:text-5xl font-bold text-white">€79</span>
                  <span className="text-white/60">/month</span>
                </div>
                <ul className="space-y-3 lg:space-y-4 mb-8">
                  {[
                    'Unlimited deals',
                    'Unlimited AI messages',
                    'Email & WhatsApp generation',
                    'Visual pipeline view',
                    'Daily email reminders',
                    'Analytics dashboard',
                    'CSV import',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80 text-sm lg:text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/login" 
                  className="block w-full py-3 lg:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl text-center hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Start 7-Day Free Trial
                </Link>
                <p className="text-center text-sm text-white/40 mt-4">No credit card required</p>
              </div>
            </div>

            {/* Agency Plan */}
            <div className="relative bg-white/5 rounded-3xl border border-white/10 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Agency</h3>
              <p className="text-white/60 mb-6">For teams of 5+ agents</p>
              <div className="mb-6">
                <span className="text-4xl lg:text-5xl font-bold text-white">€59</span>
                <span className="text-white/60">/agent/month</span>
              </div>
              <ul className="space-y-3 lg:space-y-4 mb-8">
                {[
                  'Everything in Solo',
                  'Minimum 5 agents',
                  'Centralized billing',
                  'Priority support',
                  'Dedicated onboarding',
                  'Early access to features',
                  'Custom integrations (soon)',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80 text-sm lg:text-base">
                    <CheckCircle2 className="w-5 h-5 text-white/40 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="mailto:contact@csx-estate.com" 
                className="block w-full py-3 lg:py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl text-center hover:bg-white/20 transition-all"
              >
                Contact Sales
              </a>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 text-center">
              <h3 className="text-lg lg:text-xl font-bold text-white mb-6">The math is simple</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-white">€79</div>
                  <div className="text-xs lg:text-sm text-white/60">Monthly cost</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-white">×12</div>
                  <div className="text-xs lg:text-sm text-white/60">Months</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-emerald-400">=€948</div>
                  <div className="text-xs lg:text-sm text-white/60">Per year</div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-white/80 text-sm lg:text-base">
                  Average commission on one deal: <span className="text-white font-semibold">€5,000 - €15,000</span>
                </p>
                <p className="text-white/60 mt-2 text-sm lg:text-base">
                  Save one deal per year = <span className="text-emerald-400 font-semibold">5x to 15x ROI</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "I'm already using a CRM. Why do I need this?",
                a: "Most CRMs are built for sales teams, not real estate. They don't understand deal stages like 'post-viewing' or 'waiting on notary'. CSX Estate is built specifically for how agents actually work, with AI that writes real estate messages—not generic sales follow-ups."
              },
              {
                q: "How is this different from just using ChatGPT?",
                a: "ChatGPT doesn't know your clients, your deal stages, or when to follow up. You'd have to explain everything every time. CSX Estate knows the context—it sees the client name, property, deal stage, and last contact date, then generates the right message instantly."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts, no cancellation fees. Cancel from your settings page in one click. Your data stays available until the end of your billing period."
              },
              {
                q: "Is my client data secure?",
                a: "Yes. We use Supabase (enterprise-grade PostgreSQL) with row-level security. Your data is encrypted and completely isolated from other users. We never share or sell your data."
              },
              {
                q: "How long does it take to set up?",
                a: "About 5 minutes. Sign up, add a few deals manually or import via CSV, and you're ready. No training required—if you can use email, you can use CSX Estate."
              },
            ].map((item, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 lg:p-6 cursor-pointer list-none">
                  <span className="font-medium text-white pr-4 text-sm lg:text-base">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-white/60 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 lg:px-6 pb-5 lg:pb-6">
                  <p className="text-white/60 text-sm lg:text-base">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 lg:p-12 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="relative text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Stop losing deals to forgotten follow-ups
              </h2>
              <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join agents who use AI to stay on top of every client. 7-day free trial, no credit card required.
              </p>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 px-6 lg:px-8 py-3 lg:py-4 bg-white text-blue-600 font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">CSX Estate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="mailto:contact@csx-estate.com" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          <p className="text-center text-sm text-white/40 mt-8">
            © {new Date().getFullYear()} CSX Estate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
