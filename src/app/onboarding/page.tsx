'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ScopeType = 'exact' | 'path' | 'domain' | 'subdomains';
type Protocol = 'http + https' | 'https://' | 'http://';
type Step = 'choose' | 'scope' | 'analytics' | 'ownership' | 'audit';

const SCOPE_OPTIONS: { id: ScopeType; label: string; desc: string; example: string }[] = [
  { id: 'exact',      label: 'Exact URL',   desc: 'Only specified URL',              example: 'example.com/path/' },
  { id: 'path',       label: 'Path',        desc: 'Path including subfolders',       example: 'example.com/path/*' },
  { id: 'domain',     label: 'Domain',      desc: 'Only specified domain',           example: 'example.com/*' },
  { id: 'subdomains', label: 'Subdomains',  desc: 'Domain including subdomains',     example: '*.example.com/*' },
];

// ─── Google Search Console logo ───────────────────────────────────────────────
function GSCLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#fff" />
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Step header ──────────────────────────────────────────────────────────────
function StepHeader({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'scope',     label: 'Scope' },
    { id: 'analytics', label: 'Web Analytics' },
    { id: 'ownership', label: 'Ownership' },
    { id: 'audit',     label: 'Site Audit' },
  ];
  const currentIdx = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center gap-3 py-4 px-6 border-b border-gray-800">
      <Link href="/" className="mr-8 text-white font-bold text-lg">
        <span className="text-[#f07b29]">Web</span>Audit
      </Link>
      {steps.map((step, i) => {
        const isActive = step.id === current;
        const isDone   = currentIdx > i;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
              ${isActive ? 'bg-[#f07b29] text-white' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>
              {isDone ? (
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-black
                  ${isActive ? 'border-white' : 'border-gray-600'}`}>
                  {i + 1}
                </span>
              )}
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className="flex gap-1">
                <div className={`w-1 h-1 rounded-full ${isDone ? 'bg-gray-500' : 'bg-gray-700'}`} />
                <div className={`w-1 h-1 rounded-full ${isDone ? 'bg-gray-500' : 'bg-gray-700'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Choose method ────────────────────────────────────────────────────
function ChooseStep({
  onSelect,
  onSkip,
}: {
  onSelect: (method: 'gsc' | 'manual') => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-white mb-2">Import or add your project</h1>
      <p className="text-gray-400 text-sm mb-12 text-center">
        Please note that you can use WebAudit only for websites you own.
      </p>

      <div className="flex gap-6 w-full max-w-2xl items-stretch">
        {/* Import from GSC */}
        <div className="flex-1 border border-gray-700 hover:border-gray-500 rounded-2xl p-7 bg-[#111827] flex flex-col transition">
          <div className="flex items-center gap-3 mb-6">
            <GSCLogo />
            <span className="font-bold text-white text-base">Import from GSC</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-400 flex-1">
            {[
              'Automatic ownership verification',
              'Import multiple projects at once',
              'Edit project settings later',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onSelect('gsc')}
            className="mt-6 w-full py-2.5 border border-gray-600 text-white text-sm font-semibold rounded-lg hover:border-[#f07b29] hover:text-[#f07b29] transition"
          >
            Import
          </button>
          <p className="mt-3 text-xs text-gray-600 text-center leading-relaxed">
            We&apos;ll ask you to connect your Google Account and select which projects to import
          </p>
        </div>

        <div className="flex items-center text-gray-600 text-xs font-semibold">OR</div>

        {/* Add manually */}
        <div className="flex-1 border border-gray-700 hover:border-gray-500 rounded-2xl p-7 bg-[#111827] flex flex-col transition">
          <div className="mb-5">
            {/* Step indicators: 1 ·· 2 ·· 3 */}
            <div className="flex items-center gap-1.5 mb-3">
              {[1, 2, 3].map((n, i) => (
                <div key={n} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${n === 1 ? 'border-[#f07b29] text-[#f07b29]' : 'border-gray-600 text-gray-600'}`}>
                    {n}
                  </div>
                  {i < 2 && (
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-gray-700" />
                      <div className="w-1 h-1 rounded-full bg-gray-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="font-bold text-white text-base">Add manually</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-400 flex-1">
            {[
              'Manual ownership verification required',
              'Add one project at a time',
              'Fully configure project during creation',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="text-gray-600 mt-0.5 shrink-0">·</span>
                {t}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onSelect('manual')}
            className="mt-6 w-full py-2.5 border border-gray-600 text-white text-sm font-semibold rounded-lg hover:border-[#f07b29] hover:text-[#f07b29] transition"
          >
            Add manually
          </button>
        </div>
      </div>

      {/* FIXED: skip now calls onSkip → goes to dashboard, not scope */}
      <button
        onClick={onSkip}
        className="mt-10 text-gray-500 text-sm hover:text-[#f07b29] transition"
      >
        or skip and do this later
      </button>
    </div>
  );
}

// ─── Step 2: Scope ────────────────────────────────────────────────────────────
function ScopeStep({
  domain, setDomain,
  scopeType, setScopeType,
  protocol, setProtocol,
  projectName, setProjectName,
  onNext, onBack,
}: {
  domain: string; setDomain: (v: string) => void;
  scopeType: ScopeType; setScopeType: (v: ScopeType) => void;
  protocol: Protocol; setProtocol: (v: Protocol) => void;
  projectName: string; setProjectName: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const [showProtoMenu, setShowProtoMenu] = useState(false);
  const currentScope = SCOPE_OPTIONS.find((s) => s.id === scopeType)!;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Create your first project</h1>
      <p className="text-gray-400 text-sm mb-10 text-center">Set up your website to start analyzing it.</p>

      <div className="w-full max-w-lg bg-[#111827] border border-gray-700 rounded-2xl p-8 space-y-6">
        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Scope</label>
          <div className="flex gap-2">
            {/* Protocol */}
            <div className="relative">
              <button type="button"
                onClick={() => { setShowProtoMenu(!showProtoMenu); setShowScopeMenu(false); }}
                className="flex items-center gap-2 px-3 py-2.5 bg-[#1f2937] border border-gray-600 rounded-lg text-white text-sm whitespace-nowrap hover:border-gray-500 transition">
                {protocol}
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showProtoMenu && (
                <div className="absolute top-full mt-1 left-0 bg-[#1f2937] border border-gray-600 rounded-xl shadow-xl z-50 w-36 overflow-hidden">
                  {(['http + https', 'https://', 'http://'] as Protocol[]).map((p) => (
                    <button key={p} type="button" onClick={() => { setProtocol(p); setShowProtoMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition ${protocol === p ? 'text-[#f07b29]' : 'text-white'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Domain input */}
            <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
              placeholder="Domain or path"
              className="flex-1 min-w-0 px-3 py-2.5 bg-[#1f2937] border border-[#f07b29] rounded-lg text-white placeholder-gray-600 focus:outline-none text-sm"
              autoFocus />

            {/* Scope type */}
            <div className="relative">
              <button type="button"
                onClick={() => { setShowScopeMenu(!showScopeMenu); setShowProtoMenu(false); }}
                className="flex items-center gap-2 px-3 py-2.5 bg-[#1f2937] border border-gray-600 rounded-lg text-white text-sm whitespace-nowrap hover:border-gray-500 transition">
                {currentScope.label}
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showScopeMenu && (
                <div className="absolute top-full mt-1 right-0 bg-[#1f2937] border border-gray-600 rounded-xl shadow-xl z-50 w-60 overflow-hidden">
                  {SCOPE_OPTIONS.map((opt) => (
                    <button key={opt.id} type="button"
                      onClick={() => { setScopeType(opt.id); setShowScopeMenu(false); }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition border-b border-gray-700/50 last:border-0 ${scopeType === opt.id ? 'bg-[#f07b29]/10' : ''}`}>
                      <p className={`text-sm font-semibold ${scopeType === opt.id ? 'text-[#f07b29]' : 'text-white'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      <p className="text-xs text-gray-600 mt-0.5 font-mono">{opt.example}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            We recommend &quot;http + https&quot; with the non-www version of your domain for the most complete profile.
          </p>
        </div>

        {/* Project name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project name</label>
          <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
            placeholder={domain || 'My Project'}
            className="w-full px-3 py-2.5 bg-[#1f2937] border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#f07b29] text-sm transition" />
        </div>

        {/* Folder */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Folder</label>
          <div className="w-full px-3 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-500 text-sm flex items-center justify-between">
            None
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Shared */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-500 text-sm">Shared with all workspace members</span>
          <button type="button" className="text-[#f07b29] text-xs font-medium ml-auto">Manage access</button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 text-sm hover:text-gray-300 transition">← Back</button>
        <button onClick={onNext} disabled={!domain.trim()}
          className="px-10 py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-bold rounded-xl transition disabled:opacity-40 text-sm">
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Analytics ────────────────────────────────────────────────────────
function AnalyticsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="w-16 h-16 bg-[#f07b29]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#f07b29]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Web Analytics</h1>
        <p className="text-gray-400 text-sm mb-8">
          Track visitors, traffic sources, and conversions. You can connect this later.
        </p>

        <div className="space-y-3 text-left mb-10">
          {[
            { icon: '📊', title: 'Traffic overview', desc: 'Sessions, users, pageviews, bounce rate' },
            { icon: '🌍', title: 'Traffic sources', desc: 'Organic, direct, referral, social' },
            { icon: '🎯', title: 'Conversion tracking', desc: 'Goals, events, funnels' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={onBack} className="text-gray-500 text-sm hover:text-gray-300 transition">← Back</button>
          <button onClick={onNext} className="text-gray-400 text-sm hover:text-white transition">Skip for now →</button>
          <button onClick={onNext} className="px-8 py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-bold rounded-xl transition text-sm">
            Connect Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Ownership ────────────────────────────────────────────────────────
function OwnershipStep({ domain, onNext, onBack }: { domain: string; onNext: () => void; onBack: () => void }) {
  const [method, setMethod] = useState<'dns' | 'html'>('dns');
  const token = `webaudit-verify=abc${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Verify ownership</h1>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Confirm you own <span className="text-white font-medium">{domain || 'your site'}</span> to unlock all features.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { id: 'dns',  label: 'DNS Record', icon: '🌐', desc: 'Add a TXT record to your DNS' },
            { id: 'html', label: 'HTML Tag',   icon: '📄', desc: 'Add a meta tag to your homepage' },
          ].map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id as 'dns' | 'html')}
              className={`p-4 rounded-xl border text-left transition ${method === m.id ? 'border-[#f07b29] bg-[#f07b29]/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
              <span className="text-xl mb-2 block">{m.icon}</span>
              <p className={`text-sm font-semibold ${method === m.id ? 'text-[#f07b29]' : 'text-white'}`}>{m.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        <div className="p-4 bg-gray-900 border border-gray-700 rounded-xl mb-6 text-xs">
          {method === 'dns' ? (
            <div className="space-y-3">
              <p className="text-gray-400">Add this TXT record to your DNS provider:</p>
              <div className="grid grid-cols-3 gap-2">
                <div><p className="text-gray-600 mb-1">Type</p><p className="text-white font-mono bg-gray-800 px-2 py-1.5 rounded">TXT</p></div>
                <div><p className="text-gray-600 mb-1">Name</p><p className="text-white font-mono bg-gray-800 px-2 py-1.5 rounded">@</p></div>
                <div className="col-span-3"><p className="text-gray-600 mb-1">Value</p><p className="text-white font-mono bg-gray-800 px-2 py-1.5 rounded break-all">{token}</p></div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-3">Add inside the &lt;head&gt; of your homepage:</p>
              <pre className="text-white font-mono bg-gray-800 px-3 py-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                {`<meta name="webaudit-verify" content="${token}" />`}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={onBack} className="text-gray-500 text-sm hover:text-gray-300 transition">← Back</button>
          <button onClick={onNext} className="text-gray-400 text-sm hover:text-white transition">Skip →</button>
          <button onClick={onNext} className="px-8 py-3 bg-[#f07b29] hover:bg-[#e06a18] text-white font-bold rounded-xl transition text-sm">
            Verify now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Start audit ──────────────────────────────────────────────────────
function AuditStep({ domain, projectName, onFinish, loading }: {
  domain: string; projectName: string; onFinish: () => void; loading: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Your project is ready!</h1>
        <p className="text-gray-400 text-sm mb-8">
          <span className="text-white font-medium">{projectName || domain}</span> is set up. Run your first audit now.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            { label: 'On-Page SEO', icon: '🔍', desc: 'Meta tags, headings, content quality' },
            { label: 'PageSpeed', icon: '⚡', desc: 'Core Web Vitals, mobile score' },
            { label: 'Security', icon: '🔒', desc: 'SSL, malware, blacklists' },
            { label: 'AI Visibility (GEO)', icon: '🤖', desc: 'Presence in AI search results' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{item.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
            </div>
          ))}
        </div>

        <button onClick={onFinish} disabled={loading}
          className="w-full py-3.5 bg-[#f07b29] hover:bg-[#e06a18] text-white font-bold rounded-xl transition disabled:opacity-60 text-sm mb-3">
          {loading ? 'Setting up...' : 'Start site audit →'}
        </button>
        <button onClick={onFinish} disabled={loading}
          className="w-full py-3 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl transition text-sm">
          Skip and go to dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep]             = useState<Step>('choose');
  const [domain, setDomain]         = useState('');
  const [projectName, setProjectName] = useState('');
  const [scopeType, setScopeType]   = useState<ScopeType>('subdomains');
  const [protocol, setProtocol]     = useState<Protocol>('http + https');
  const [loading, setLoading]       = useState(false);
  const router = useRouter();

  const completeOnboarding = async (withSite: boolean) => {
    setLoading(true);
    try {
      // Always mark onboarding as complete first
      await fetch('/api/onboarding/complete', { method: 'POST' });

      if (withSite && domain.trim()) {
        const url = domain.includes('://') ? domain.trim() : `https://${domain.trim()}`;

        // Create monitored site
        await fetch('/api/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, name: projectName || domain, scanFrequency: 'WEEKLY' }),
        });

        // Start first audit
        const auditRes = await fetch('/api/audits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (auditRes.ok) {
          const audit = await auditRes.json();
          router.push(`/dashboard/audits/${audit.id}`);
          return;
        }
      }

      router.push('/dashboard');
    } catch {
      // Even on error, go to dashboard (onboarding marked complete above)
      router.push('/dashboard');
    }
  };

  const isProjectStep = (step as string) !== 'choose';

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        {isProjectStep ? (
          <StepHeader current={step} />
        ) : (
          <>
            <Link href="/" className="text-white font-bold text-lg">
              <span className="text-[#f07b29]">Web</span>Audit
            </Link>
            <button onClick={() => completeOnboarding(false)} className="text-gray-500 text-sm hover:text-gray-300 transition">
              ✕
            </button>
          </>
        )}
      </div>

      {step === 'choose' && (
        <ChooseStep
          onSelect={() => setStep('scope')}
          onSkip={() => completeOnboarding(false)}
        />
      )}
      {step === 'scope' && (
        <ScopeStep
          domain={domain} setDomain={setDomain}
          scopeType={scopeType} setScopeType={setScopeType}
          protocol={protocol} setProtocol={setProtocol}
          projectName={projectName} setProjectName={setProjectName}
          onNext={() => setStep('analytics')}
          onBack={() => setStep('choose')}
        />
      )}
      {step === 'analytics' && (
        <AnalyticsStep onNext={() => setStep('ownership')} onBack={() => setStep('scope')} />
      )}
      {step === 'ownership' && (
        <OwnershipStep domain={domain} onNext={() => setStep('audit')} onBack={() => setStep('analytics')} />
      )}
      {step === 'audit' && (
        <AuditStep domain={domain} projectName={projectName} onFinish={() => completeOnboarding(true)} loading={loading} />
      )}
    </div>
  );
}
