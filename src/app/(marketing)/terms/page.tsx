import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — WebAudit',
  description: 'The terms and conditions governing your use of WebAudit.',
};

const LAST_UPDATED = '2026-06-01';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Legal</div>
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date(LAST_UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="space-y-10">
          {[
            {
              title: '1. Acceptance',
              content: 'By creating an account or using WebAudit, you agree to these Terms of Service. If you are using WebAudit on behalf of an organisation, you represent that you have the authority to bind that organisation to these terms.',
            },
            {
              title: '2. The service',
              content: 'WebAudit provides automated website auditing and monitoring services. We reserve the right to modify or discontinue any feature at any time with reasonable notice. We will not materially degrade paid plan features without 30 days notice.',
            },
            {
              title: '3. Acceptable use',
              content: `You may not use WebAudit to:
- Audit websites you do not own or have explicit permission to analyse
- Attempt to circumvent rate limits or abuse the API
- Reverse-engineer, resell, or redistribute audit data without permission
- Submit URLs containing malware or illegal content
- Automate audits in a manner that disrupts our infrastructure`,
            },
            {
              title: '4. Account responsibility',
              content: 'You are responsible for maintaining the security of your account credentials. Notify us immediately at security@webaudit.app if you suspect unauthorised access. We are not liable for losses resulting from compromised credentials.',
            },
            {
              title: '5. Subscriptions and billing',
              content: 'Paid subscriptions are billed monthly or annually in advance. Downgrades take effect at the next billing cycle. Refunds are provided at our discretion within 14 days of purchase for annual plans. Monthly subscriptions are non-refundable.',
            },
            {
              title: '6. Free plan limitations',
              content: 'Free plans are subject to fair use limits. We reserve the right to throttle or suspend free accounts that exceed reasonable usage. Commercial use of the free plan is not permitted.',
            },
            {
              title: '7. Intellectual property',
              content: 'WebAudit retains all intellectual property rights in the platform. You retain ownership of your data. By using the service, you grant us a limited licence to process your submitted URLs for the purpose of delivering audit results.',
            },
            {
              title: '8. Disclaimer of warranties',
              content: 'WebAudit is provided "as is" without warranty of any kind. We do not guarantee that audit results will improve your search rankings. Search engine algorithms are outside our control.',
            },
            {
              title: '9. Limitation of liability',
              content: 'To the maximum extent permitted by law, WebAudit\'s total liability to you for any claim arising from use of the service is limited to the amount you paid in the 12 months preceding the claim. We are not liable for indirect, consequential, or lost revenue damages.',
            },
            {
              title: '10. Governing law',
              content: 'These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales.',
            },
            {
              title: '11. Changes',
              content: 'We may update these terms. We will notify you via email at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance.',
            },
            {
              title: '12. Contact',
              content: 'Legal questions: legal@webaudit.app',
            },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-white mb-3">{s.title}</h2>
              <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
