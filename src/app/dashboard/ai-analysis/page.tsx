'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

type Provider = 'claude' | 'openai' | 'gemini';

interface ScrapeInfo {
  title: string;
  url: string;
  wordCount: number;
  loadTime: number;
  technologies: string[];
}

interface Scores {
  overall: number;
  seo: number;
  ux: number;
  brand: number;
  content: number;
  performance: number;
  accessibility: number;
  conversion: number;
  technical: number;
  mobile: number;
}

const PROVIDERS: { id: Provider; name: string; model: string; available: boolean; envVar?: string; configured?: boolean }[] = [
  { id: 'gemini', name: 'Gemini 2.5', model: 'gemini-2.5-flash', available: true, configured: true },
  { id: 'claude', name: 'Claude Opus', model: 'claude-opus-4-8', available: true, envVar: 'ANTHROPIC_API_KEY' },
  { id: 'openai', name: 'GPT-4o', model: 'gpt-4o', available: true, envVar: 'OPENAI_API_KEY' },
];

const CATEGORY_LABELS: Record<keyof Scores, { label: string; icon: string }> = {
  overall: { label: 'Overall', icon: '⭐' },
  seo: { label: 'SEO', icon: '🔍' },
  ux: { label: 'UX & Navigation', icon: '🎯' },
  brand: { label: 'Brand & Design', icon: '🎨' },
  content: { label: 'Content', icon: '✍️' },
  performance: { label: 'Performance', icon: '⚡' },
  accessibility: { label: 'Accessibility', icon: '♿' },
  conversion: { label: 'Conversion', icon: '💰' },
  technical: { label: 'Technical', icon: '🔧' },
  mobile: { label: 'Mobile', icon: '📱' },
};

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-400';
  if (s >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBg(s: number) {
  if (s >= 80) return 'bg-green-500/20 border-green-500/30';
  if (s >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${scoreColor(score)}`}>{score}</span>
    </div>
  );
}

function parseSection(text: string, marker: string): string {
  const start = text.indexOf(`===${marker}===`);
  if (start === -1) return '';
  const end = text.indexOf('===', start + marker.length + 6);
  return end === -1 ? text.slice(start + marker.length + 6).trim() : text.slice(start + marker.length + 6, end).trim();
}

function parseScores(text: string): Scores | null {
  const section = parseSection(text, 'SCORES');
  if (!section) return null;
  try {
    return JSON.parse(section.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
  } catch { return null; }
}

function MarkdownSection({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-white mt-4 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-5 mb-2">{line.slice(3)}</h2>;
        if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} className="text-white font-bold mt-3 mb-1">{line.slice(2, -2)}</h3>;
        if (line.startsWith('- ')) return <li key={i} className="text-slate-300 text-sm ml-4 list-disc leading-relaxed">{parseInline(line.slice(2))}</li>;
        if (line.match(/^\d+\. /)) return <li key={i} className="text-slate-300 text-sm ml-4 list-decimal leading-relaxed">{parseInline(line.replace(/^\d+\. /, ''))}</li>;
        if (line.startsWith('```')) return null;
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-slate-300 text-sm leading-relaxed">{parseInline(line)}</p>;
      })}
    </div>
  );
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      : p
  );
}

const SECTION_KEYS = [
  { key: 'SEO_ANALYSIS', label: 'SEO Analysis', icon: '🔍', color: 'blue' },
  { key: 'UX_ANALYSIS', label: 'UX & Navigation', icon: '🎯', color: 'purple' },
  { key: 'BRAND_ANALYSIS', label: 'Brand & Design', icon: '🎨', color: 'pink' },
  { key: 'CONTENT_ANALYSIS', label: 'Content Strategy', icon: '✍️', color: 'cyan' },
  { key: 'PERFORMANCE_ANALYSIS', label: 'Performance', icon: '⚡', color: 'yellow' },
  { key: 'ACCESSIBILITY_ANALYSIS', label: 'Accessibility', icon: '♿', color: 'green' },
  { key: 'CONVERSION_ANALYSIS', label: 'Conversion', icon: '💰', color: 'orange' },
  { key: 'TECHNICAL_ANALYSIS', label: 'Technical', icon: '🔧', color: 'slate' },
  { key: 'QUICK_WINS', label: 'Quick Wins', icon: '🚀', color: 'emerald' },
  { key: 'ROADMAP', label: 'Roadmap', icon: '🗺️', color: 'indigo' },
];

const colorMap: Record<string, string> = {
  blue: 'border-blue-500/30 bg-blue-500/5',
  purple: 'border-purple-500/30 bg-purple-500/5',
  pink: 'border-pink-500/30 bg-pink-500/5',
  cyan: 'border-cyan-500/30 bg-cyan-500/5',
  yellow: 'border-yellow-500/30 bg-yellow-500/5',
  green: 'border-green-500/30 bg-green-500/5',
  orange: 'border-orange-500/30 bg-orange-500/5',
  slate: 'border-slate-600/40 bg-slate-800/20',
  emerald: 'border-emerald-500/30 bg-emerald-500/5',
  indigo: 'border-indigo-500/30 bg-indigo-500/5',
};

export default function AiAnalysisPage() {
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<Provider>('gemini');
  const [status, setStatus] = useState<'idle' | 'scraping' | 'analyzing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [rawText, setRawText] = useState('');
  const [scrapeInfo, setScrapeInfo] = useState<ScrapeInfo | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) return;
    setStatus('scraping');
    setError('');
    setRawText('');
    setScrapeInfo(null);
    setScores(null);

    abortRef.current?.abort();
    const ab = new AbortController();
    abortRef.current = ab;

    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), provider }),
        signal: ab.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === 'PLAN_LIMIT') {
          setError('AI Deep Analysis requires a PRO or Agency plan. Upgrade to unlock.');
        } else {
          setError(data.error ?? 'Analysis failed.');
        }
        setStatus('error');
        return;
      }

      setStatus('analyzing');
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = dec.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === 'scrape') {
              setScrapeInfo(evt.site);
            } else if (evt.type === 'chunk') {
              accumulated += evt.text;
              setRawText(accumulated);
              const parsed = parseScores(accumulated);
              if (parsed) setScores(parsed);
            } else if (evt.type === 'done') {
              setStatus('done');
              const parsed = parseScores(accumulated);
              if (parsed) setScores(parsed);
            } else if (evt.type === 'error') {
              setError(evt.message);
              setStatus('error');
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'AbortError') return;
      setError('Network error. Please try again.');
      setStatus('error');
    }
  }, [url, provider]);

  const isRunning = status === 'scraping' || status === 'analyzing';

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl">🤖</div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Deep Analysis</h1>
              <p className="text-slate-400 text-sm">Comprehensive website analysis powered by AI — brand, UX, SEO, performance, and more</p>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Website URL to analyse</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !isRunning) handleAnalyze(); }}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/60 transition"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isRunning || !url.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/20 whitespace-nowrap"
                >
                  {isRunning ? 'Analysing…' : '🤖 Analyse'}
                </button>
              </div>
            </div>

            {/* Provider selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Model</label>
              <div className="flex flex-wrap gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${provider === p.id ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                  >
                    <span className="text-base">{p.id === 'claude' ? '🟣' : p.id === 'openai' ? '🟢' : '🔵'}</span>
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-500 font-normal">{p.model}</span>
                    {p.configured && <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 rounded border border-green-500/20">✓ Ready</span>}
                    {p.envVar && !p.configured && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 rounded">{p.envVar}</span>}
                  </button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-2">Gemini 2.5 is ready to use. Claude and OpenAI require their API keys in .env.local</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/30 bg-red-500/10">
            <p className="text-red-400 font-semibold text-sm mb-2">
              {error.startsWith('{') || error.startsWith('4')
                ? 'API authentication failed. The Claude API key is not configured.'
                : error}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {(error.includes('Claude') || error.includes('key') || error.startsWith('{') || error.startsWith('4')) && (
                <button
                  onClick={() => { setProvider('gemini'); setStatus('idle'); setError(''); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-xs"
                >
                  🔵 Switch to Gemini 2.5 →
                </button>
              )}
              {error.includes('PRO') && (
                <Link href="/dashboard/billing" className="inline-block px-4 py-2 bg-[#f07b29] hover:bg-orange-500 text-white font-bold rounded-xl transition text-xs">
                  Upgrade to PRO →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Progress / Scrape info */}
        {(status === 'scraping' || status === 'analyzing') && (
          <div className="mb-6 p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-300 font-semibold text-sm">
                {status === 'scraping' ? 'Scraping website…' : 'AI analysis in progress…'}
              </span>
            </div>
            {scrapeInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {[
                  { label: 'Title', value: scrapeInfo.title?.slice(0, 40) || '—' },
                  { label: 'Words', value: scrapeInfo.wordCount?.toLocaleString() || '—' },
                  { label: 'Load Time', value: scrapeInfo.loadTime ? `${scrapeInfo.loadTime}ms` : '—' },
                  { label: 'Stack', value: scrapeInfo.technologies?.slice(0, 2).join(', ') || '—' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-slate-500 text-xs">{s.label}</div>
                    <div className="text-white text-sm font-semibold truncate">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {rawText && (
          <div className="space-y-6">

            {/* Scores overview */}
            {scores && (
              <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center ${scoreBg(scores.overall)}`}>
                    <span className={`text-3xl font-black ${scoreColor(scores.overall)}`}>{scores.overall}</span>
                    <span className="text-slate-500 text-[10px] font-bold">/ 100</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">Analysis Complete</h2>
                    {scrapeInfo && <p className="text-slate-400 text-sm mt-0.5">{scrapeInfo.url}</p>}
                    <p className="text-slate-500 text-xs mt-1">Analysed by {PROVIDERS.find(p => p.id === provider)?.name}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(Object.entries(scores) as [keyof Scores, number][])
                    .filter(([k]) => k !== 'overall')
                    .map(([key, val]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-base w-6">{CATEGORY_LABELS[key].icon}</span>
                        <span className="text-slate-400 text-sm w-32 shrink-0">{CATEGORY_LABELS[key].label}</span>
                        <ScoreBar score={val} label={CATEGORY_LABELS[key].label} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Executive Summary */}
            {parseSection(rawText, 'EXECUTIVE_SUMMARY') && (
              <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <span>📋</span> Executive Summary
                </h2>
                <p className="text-slate-300 leading-relaxed">{parseSection(rawText, 'EXECUTIVE_SUMMARY')}</p>
              </div>
            )}

            {/* Category sections */}
            <div className="grid lg:grid-cols-2 gap-5">
              {SECTION_KEYS.map(({ key, label, icon, color }) => {
                const content = parseSection(rawText, key);
                if (!content) return null;
                return (
                  <div key={key} className={`p-6 rounded-2xl border ${colorMap[color]}`}>
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                      <span>{icon}</span> {label}
                    </h2>
                    <MarkdownSection text={content} />
                  </div>
                );
              })}
            </div>

            {/* Streaming indicator */}
            {isRunning && (
              <div className="text-center py-4">
                <span className="inline-flex items-center gap-2 text-purple-400 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-200" />
                  Generating analysis…
                </span>
              </div>
            )}

            {/* Export */}
            {status === 'done' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const blob = new Blob([rawText], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `ai-analysis-${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}-${Date.now()}.txt`;
                    a.click();
                  }}
                  className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition text-sm"
                >
                  📥 Export TXT
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(rawText)}
                  className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition text-sm"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => {
                    setUrl('');
                    setStatus('idle');
                    setRawText('');
                    setScores(null);
                    setScrapeInfo(null);
                  }}
                  className="px-5 py-2.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-semibold rounded-xl transition text-sm"
                >
                  🔄 New Analysis
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {status === 'idle' && !rawText && (
          <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-white font-bold text-xl mb-2">AI Website Deep Analysis</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
              Enter any website URL above to get a comprehensive AI-powered analysis covering brand, UX, SEO, content strategy, performance, accessibility, conversion, and technical health — with specific, actionable recommendations.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { icon: '🔍', label: '10 Analysis Categories', desc: 'SEO, UX, Brand, Content, Performance, Accessibility, Conversion, Technical, Mobile' },
                { icon: '⚡', label: 'Real-time Streaming', desc: 'Results stream in live as the AI analyses each section' },
                { icon: '🚀', label: 'Actionable Fixes', desc: 'Quick wins, code examples, and a 90-day roadmap' },
              ].map(f => (
                <div key={f.label} className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/40 text-left">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-white font-semibold text-sm mb-1">{f.label}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Example URLs */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              <span className="text-slate-600 text-xs">Try:</span>
              {['stripe.com', 'linear.app', 'vercel.com', 'notion.so'].map(ex => (
                <button
                  key={ex}
                  onClick={() => setUrl(`https://${ex}`)}
                  className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded border border-slate-800 hover:border-blue-500/30 transition font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
