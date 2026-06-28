import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — WebAudit',
  description: 'How WebAudit collects, uses, and protects your personal data. GDPR compliant.',
};

const LAST_UPDATED = '2026-06-01';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">Legal</div>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date(LAST_UPDATED).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose-dark space-y-10">
          {[
            {
              title: '1. Who we are',
              content: 'WebAudit ("we", "us", "our") is an automated website auditing service. Our registered address and data controller details are available on request at privacy@webaudit.app.',
            },
            {
              title: '2. What data we collect',
              content: `We collect the following categories of personal data:

**Account data:** Name, email address, and password hash (email/password sign-up) or OAuth profile data (Google sign-in).

**Audit data:** The URLs you submit for auditing. We analyse these URLs technically and store the results. We do not store page content beyond technical metadata (HTTP headers, status codes, score results).

**Usage data:** Pages visited, features used, and browser/device information collected via server logs and first-party analytics.

**Payment data:** Subscription status and plan tier. Card details are handled exclusively by Stripe and are never stored by WebAudit.`,
            },
            {
              title: '3. How we use your data',
              content: `We use your data to:
- Provide and improve the WebAudit service
- Send transactional emails (audit complete, score alerts, account notifications)
- Process payments via Stripe
- Comply with legal obligations

We do not sell your personal data to third parties. We do not use your data for advertising.`,
            },
            {
              title: '4. Legal basis (GDPR)',
              content: `For users in the European Economic Area and United Kingdom:
- **Contract performance:** Processing your account data and audit results to provide the service you signed up for.
- **Legitimate interests:** Improving our service, preventing fraud, and maintaining platform security.
- **Consent:** Sending marketing emails (where you have opted in).`,
            },
            {
              title: '5. Data retention',
              content: 'Account data is retained for the lifetime of your account plus 30 days after deletion. Audit results are retained according to your plan tier (Free: 30 days, Starter: 90 days, PRO/Agency: 1 year). You can request deletion of all your data at any time.',
            },
            {
              title: '6. Third-party services',
              content: `We use the following sub-processors:
- **Vercel** — hosting and serverless infrastructure (US/EU)
- **Neon / PlanetScale** — database hosting (EU)
- **Stripe** — payment processing (US/EU)
- **Resend** — transactional email delivery (US)
- **Anthropic** — AI-powered audit summaries (US)`,
            },
            {
              title: '7. Cookies',
              content: 'We use strictly necessary session cookies for authentication and first-party analytics cookies. We do not use third-party advertising cookies. See our Cookie Policy for details.',
            },
            {
              title: '8. Your rights',
              content: `Under GDPR and UK GDPR, you have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion ("right to be forgotten")
- Object to or restrict processing
- Data portability

To exercise any right, email privacy@webaudit.app. We will respond within 30 days.`,
            },
            {
              title: '9. Security',
              content: 'We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and regular third-party security audits. See our Security page for details.',
            },
            {
              title: '10. Changes to this policy',
              content: 'We will notify you of material changes to this policy via email. Continued use of WebAudit after the effective date constitutes acceptance of the revised policy.',
            },
            {
              title: '11. Contact',
              content: 'Questions? Email privacy@webaudit.app or write to our registered address.',
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
