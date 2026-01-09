import Link from 'next/link';
import { 
  Building2, Sparkles, Clock, MessageSquare, BarChart3, 
  Zap, Shield, Check, ArrowRight, ChevronDown,
  Mail, Phone, Calendar, Target
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-ink-600">CSX Estate</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-ink-400 hover:text-ink-600">Features</a>
              <a href="#how-it-works" className="text-sm text-ink-400 hover:text-ink-600">How it works</a>
              <a href="#pricing" className="text-sm text-ink-400 hover:text-ink-600">Pricing</a>
              <a href="#faq" className="text-sm text-ink-400 hover:text-ink-600">FAQ</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-ink-400 hover:text-ink-600">
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 text-sm font-medium rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Follow-ups for Real Estate
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-600 leading-tight mb-6">
            Stop losing deals to{' '}
            <span className="text-brand-600">forgotten follow-ups</span>
          </h1>
          <p className="text-xl text-ink-300 max-w-2xl mx-auto mb-8">
            The average agent loses 3-5 deals per year from poor follow-up timing. 
            Our AI tells you who to contact and writes the message for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#how-it-works" 
              className="w-full sm:w-auto px-8 py-3 bg-surface-100 text-ink-500 font-medium rounded-xl hover:bg-surface-200 transition-colors"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-ink-200 mt-4">
            No credit card required • Full access for 7 days
          </p>
        </div>
      </section>

      {/* Screenshot - Dashboard */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-1.5 shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              <img 
                src="/screenshots/dashboard.svg" 
                alt="CSX Estate Dashboard showing overdue, due today, and upcoming follow-ups"
                className="w-full h-auto block"
              />
            </div>
          </div>
          <p className="text-center text-sm text-ink-300 mt-4">
            See exactly who needs follow-up today, tomorrow, and who&apos;s overdue
          </p>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 px-4 bg-ink-600">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Without CSX Estate</h2>
              <ul className="space-y-4">
                {[
                  'Leads go cold because you forgot to follow up',
                  'You waste 30+ minutes writing the same emails',
                  'Deals slip through the cracks in spreadsheets',
                  'No idea who needs attention today',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-ink-200">
                    <span className="text-red-400 mt-1">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">With CSX Estate</h2>
              <ul className="space-y-4">
                {[
                  'Never miss a follow-up with smart reminders',
                  'AI writes personalized messages in seconds',
                  'Visual pipeline shows every deal at a glance',
                  'Daily email tells you exactly what to do',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <span className="text-emerald-400 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-600 mb-4">
              Everything you need to close more deals
            </h2>
            <p className="text-lg text-ink-300 max-w-2xl mx-auto">
              Built specifically for real estate agents. No bloated features, 
              just what actually helps you close.
            </p>
          </div>

          {/* Feature 1 - AI Messages */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                AI-Powered
              </div>
              <h3 className="text-2xl font-bold text-ink-600 mb-4">
                Messages that sound like you wrote them
              </h3>
              <p className="text-ink-300 mb-6">
                One click generates the perfect follow-up based on where the deal is. 
                New lead? Offer submitted? Waiting on documents? The AI knows exactly what to say.
              </p>
              <ul className="space-y-3">
                {[
                  '15 stage-specific message templates',
                  'Email or WhatsApp format',
                  'Friendly, neutral, or firm tone',
                  'Copy or send directly',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-50 rounded-xl p-1.5">
              <img 
                src="/screenshots/message-generator.svg" 
                alt="AI message generator showing a personalized follow-up email"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Feature 2 - Pipeline */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1 bg-surface-50 rounded-xl p-1.5">
              <img 
                src="/screenshots/deals-table.svg" 
                alt="Deals table showing all clients with stages and follow-up status"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
                <Target className="w-4 h-4" />
                Visual Pipeline
              </div>
              <h3 className="text-2xl font-bold text-ink-600 mb-4">
                See every deal at a glance
              </h3>
              <p className="text-ink-300 mb-6">
                Drag and drop deals through your pipeline. From first contact to closing, 
                always know exactly where each client stands.
              </p>
              <ul className="space-y-3">
                {[
                  '15 stages from lead to closing',
                  'Separate tracks for buyers & sellers',
                  'Drag-and-drop to update status',
                  'Filter by stage, client type, or search',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3 - Reminders */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full mb-4">
                <Clock className="w-4 h-4" />
                Smart Reminders
              </div>
              <h3 className="text-2xl font-bold text-ink-600 mb-4">
                Never forget a follow-up again
              </h3>
              <p className="text-ink-300 mb-6">
                Each deal stage has optimal follow-up timing built in. 
                Get a daily email every morning with exactly who needs your attention.
              </p>
              <ul className="space-y-3">
                {[
                  'Stage-specific follow-up timing',
                  'Daily email digest at 8am',
                  'Overdue alerts highlighted',
                  'One click to generate message',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-50 rounded-xl p-6">
              {/* Email preview mockup */}
              <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
                <div className="bg-surface-50 px-4 py-3 border-b border-surface-200">
                  <p className="text-sm font-medium text-ink-500">📋 3 follow-ups need your attention</p>
                  <p className="text-xs text-ink-300">From: CSX Estate</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-ink-600">Marie Dupont</p>
                      <p className="text-xs text-ink-300">Post viewing follow-up</p>
                    </div>
                    <span className="text-xs text-red-600 font-medium">Overdue</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-ink-600">Jean Martin</p>
                      <p className="text-xs text-ink-300">Contract signing</p>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">Due today</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-ink-600">Sophie Bernard</p>
                      <p className="text-xs text-ink-300">Financing check</p>
                    </div>
                    <span className="text-xs text-ink-400">Tomorrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-600 mb-4">
              Start closing more deals in 3 steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add your deals',
                description: 'Import existing clients via CSV or add them one by one. Takes 2 minutes to get started.',
                icon: Building2,
              },
              {
                step: '2',
                title: 'Check your dashboard',
                description: "Every morning, see exactly who needs follow-up. No more guessing or checking spreadsheets.",
                icon: Calendar,
              },
              {
                step: '3',
                title: 'Send AI messages',
                description: 'Click generate, review the message, and send. What used to take 10 minutes now takes 10 seconds.',
                icon: MessageSquare,
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-soft">
                <div className="w-12 h-12 bg-brand-600 text-white text-xl font-bold rounded-full flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-ink-600 mb-2">
                  {item.title}
                </h3>
                <p className="text-ink-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white">15</p>
              <p className="text-brand-200 text-sm">Deal stages covered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">&lt;10s</p>
              <p className="text-brand-200 text-sm">To generate a message</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">€79</p>
              <p className="text-brand-200 text-sm">Per month, unlimited</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-ink-600 mb-4">
              Simple pricing. Serious results.
            </h2>
            <p className="text-lg text-ink-300">
              If this saves you just one deal per year, it pays for itself 10x over.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo Plan */}
            <div className="bg-white border-2 border-brand-600 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-semibold text-ink-600 mb-2">Solo Agent</h3>
              <p className="text-ink-300 text-sm mb-6">Everything you need to close more deals</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-ink-600">€79</span>
                <span className="text-ink-300">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited deals',
                  'Unlimited AI messages',
                  'Email & WhatsApp generation',
                  'Visual pipeline view',
                  'Daily email reminders',
                  'Analytics dashboard',
                  'CSV import',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href="/login" 
                className="block w-full py-3 text-center bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
              >
                Start 7-Day Free Trial
              </Link>
              <p className="text-xs text-ink-200 text-center mt-3">No credit card required</p>
            </div>

            {/* Agency Plan */}
            <div className="bg-ink-600 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Agency</h3>
              <p className="text-ink-200 text-sm mb-6">For teams of 5+ agents</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">€59</span>
                <span className="text-ink-200">/agent/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Solo',
                  'Minimum 5 agents',
                  'Centralized billing',
                  'Priority support',
                  'Dedicated onboarding',
                  'Early access to new features',
                  'Custom integrations (soon)',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink-100">
                    <Check className="w-4 h-4 text-brand-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="mailto:contact@csx-estate.com?subject=Agency%20Plan%20Inquiry" 
                className="block w-full py-3 text-center bg-white text-ink-600 font-medium rounded-xl hover:bg-surface-50 transition-colors"
              >
                Contact Us
              </a>
              <p className="text-xs text-ink-300 text-center mt-3">Custom setup included</p>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="mt-12 bg-surface-50 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="font-semibold text-ink-600 mb-4 text-center">The math is simple</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-ink-600">€79</p>
                <p className="text-xs text-ink-300">Monthly cost</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-600">×12</p>
                <p className="text-xs text-ink-300">Months</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-600">=€948</p>
                <p className="text-xs text-ink-300">Per year</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-surface-200 text-center">
              <p className="text-ink-400">
                Average commission on one deal: <span className="font-semibold text-ink-600">€5,000 - €15,000</span>
              </p>
              <p className="text-sm text-ink-300 mt-1">
                Save one deal per year = 5x to 15x ROI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-surface-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink-600 mb-4">
              Frequently Asked Questions
            </h2>
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
                q: "What if the AI-generated messages don't sound like me?",
                a: "You can choose between friendly, neutral, or firm tones. The messages are designed to be professional and customizable—review and edit before sending. Most agents copy-paste directly, but you're always in control."
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
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day free trial so you can test everything before paying. After that, we don't offer refunds, but you can cancel anytime to stop future charges."
              },
              {
                q: "Will you add more features?",
                a: "Yes. Planned features include: document tracking, calendar integration, team collaboration, and mobile app. Agency customers get early access to new features."
              },
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-soft">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-ink-600 pr-4">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-ink-300 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-ink-400">{item.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-ink-300">
              Have another question?{' '}
              <a href="mailto:contact@csx-estate.com" className="text-brand-600 hover:underline">
                Email us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-ink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stop losing deals to forgotten follow-ups
          </h2>
          <p className="text-lg text-ink-200 mb-8 max-w-2xl mx-auto">
            Join agents who use AI to stay on top of every client. 
            7-day free trial, no credit card required.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-ink-600 font-medium rounded-xl hover:bg-surface-50 transition-colors"
          >
            Start Your Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-surface-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-ink-500">CSX Estate</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-ink-300">
              <a href="mailto:contact@csx-estate.com" className="hover:text-ink-500">Contact</a>
              <a href="#" className="hover:text-ink-500">Privacy Policy</a>
              <a href="#" className="hover:text-ink-500">Terms of Service</a>
            </div>
          </div>
          <p className="text-sm text-ink-200 text-center mt-8">
            © {new Date().getFullYear()} CSX Estate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
