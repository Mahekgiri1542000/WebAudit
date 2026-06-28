import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact WebAudit — Talk to Our Team',
  description: 'Get in touch with the WebAudit team for sales enquiries, support, partnerships, or press requests.',
  openGraph: { title: 'Contact WebAudit', description: 'Talk to our team about enterprise plans, partnerships, or get help.' },
};

const CHANNELS = [
  { icon: '💬', title: 'General Support', desc: 'Questions about your account, billing, or how to use a feature.', link: 'mailto:support@webaudit.app', label: 'support@webaudit.app' },
  { icon: '🏢', title: 'Enterprise Sales', desc: 'Interested in custom plans, team access, or a white-label solution?', link: 'mailto:sales@webaudit.app', label: 'sales@webaudit.app' },
  { icon: '🤝', title: 'Partnerships', desc: 'Integrations, affiliate programmes, and co-marketing opportunities.', link: 'mailto:partners@webaudit.app', label: 'partners@webaudit.app' },
  { icon: '📰', title: 'Press & Media', desc: 'Press kit, interview requests, and company information.', link: 'mailto:press@webaudit.app', label: 'press@webaudit.app' },
];

const FAQS = [
  { q: 'How quickly do you respond?', a: 'Support tickets are answered within 4 business hours for paid plans. Free users receive responses within 24 hours.' },
  { q: 'Do you offer a live demo?', a: 'Yes — enterprise and Agency customers can book a 30-minute live demo with our team. Use the sales email above to schedule.' },
  { q: 'Can I get a custom plan?', a: 'Absolutely. We offer custom contracts for teams with specific audit volume, SLA, or white-label needs. Contact our sales team.' },
  { q: 'Where are you based?', a: 'WebAudit is a fully remote company with team members across North America, Europe, and Asia.' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#020817]">

      {/* HERO */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Contact</div>
          <h1 className="text-5xl font-bold text-white mb-4">Get in touch</h1>
          <p className="text-slate-400 text-xl">We read every message. Whether it&apos;s a question, idea, or enterprise enquiry — reach out and we&apos;ll get back to you fast.</p>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 gap-5">
          {CHANNELS.map(c => (
            <a key={c.title} href={c.link} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/70 transition group">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition">{c.title}</h3>
              <p className="text-slate-400 text-sm mb-3">{c.desc}</p>
              <span className="text-blue-400 text-sm font-mono">{c.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="p-8 rounded-3xl border border-slate-800/60 bg-slate-900/40">
          <h2 className="text-2xl font-bold text-white mb-2">Send us a message</h2>
          <p className="text-slate-400 text-sm mb-8">We&apos;ll reply within one business day.</p>

          <form className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First name</label>
                <input type="text" placeholder="Alex" className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last name</label>
                <input type="text" placeholder="Kumar" className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work email</label>
              <input type="email" placeholder="alex@company.com" className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Enquiry type</label>
              <select className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/60 transition">
                <option>General support</option>
                <option>Enterprise / Sales</option>
                <option>Partnership</option>
                <option>Press / Media</option>
                <option>Bug report</option>
                <option>Feature request</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Message</label>
              <textarea rows={5} placeholder="Tell us how we can help…" className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 transition resize-none" />
            </div>
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20">
              Send message →
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Common questions</h2>
        <div className="space-y-4">
          {FAQS.map(f => (
            <div key={f.q} className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
              <h3 className="text-white font-bold mb-2">{f.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
