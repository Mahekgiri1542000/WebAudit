import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlanTier } from '@/lib/billing/usage';
import { PLAN_FEATURES } from '@/lib/billing/plans';
import { scrapeWebsite } from '@/lib/ai-analysis/scraper';
import { buildAnalysisPrompt } from '@/lib/ai-analysis/prompt';
import Anthropic from '@anthropic-ai/sdk';

const PLAN_RANK: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, AGENCY: 3 };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const planTier = await getUserPlanTier(session.user.id);
  const features = PLAN_FEATURES[planTier];

  if (!features.aiSuggestions) {
    return NextResponse.json({
      error: 'AI Deep Analysis requires a PRO or Agency plan.',
      code: 'PLAN_LIMIT',
      requiredPlan: 'PRO',
    }, { status: 402 });
  }

  const { url, provider = 'claude' } = await req.json().catch(() => ({}));
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
  }

  // Scrape the website
  let site;
  try {
    site = await scrapeWebsite(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Could not fetch website: ${msg}` }, { status: 422 });
  }

  const prompt = buildAnalysisPrompt(site);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (provider === 'claude' || !provider) {
    const claudeNotConfigured = !apiKey
      || apiKey.includes('REPLACE_ME')
      || apiKey === 'sk-ant-REPLACE_ME'
      || !apiKey.startsWith('sk-ant-')
      || apiKey.length < 40;

    if (claudeNotConfigured) {
      // Stream a mock demo if key not configured
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const demo = `===EXECUTIVE_SUMMARY===\n**Demo mode** — configure ANTHROPIC_API_KEY to enable live AI analysis.\n\n===SCORES===\n{"overall":72,"seo":68,"ux":75,"brand":70,"content":65,"performance":80,"accessibility":60,"conversion":70,"technical":72,"mobile":74}\n\n===SEO_ANALYSIS===\n**Score: 68/100**\n\n**What's Working:**\n- Title tag present: "${site.title}"\n- ${site.metaDescription ? 'Meta description found' : 'Meta description missing — add one'}\n\n**Critical Issues:**\n- ${site.imagesWithoutAlt > 0 ? `${site.imagesWithoutAlt} images are missing alt text` : 'Alt text coverage looks good'}\n- ${site.schemaTypes.length === 0 ? 'No structured data / JSON-LD schema detected' : `Schema types found: ${site.schemaTypes.join(', ')}`}\n\n**Recommendations:**\n1. Add a meta description under 160 characters\n2. Implement JSON-LD Organization schema\n3. Add FAQ schema to key pages\n\n===QUICK_WINS===\n1. **Add meta description** — Impact: High | Effort: Low | Under 160 chars, include primary keyword\n2. **Fix ${site.imagesWithoutAlt} missing alt texts** — Impact: High | Effort: Low | Accessibility + SEO win\n3. **Add canonical URL** — Impact: Medium | Effort: Low | Prevent duplicate content\n4. **Add JSON-LD schema** — Impact: High | Effort: Medium | Improves AI search visibility\n5. **Add security headers** — Impact: High | Effort: Low | HSTS, CSP, X-Frame-Options\n\n===END===`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'scrape', site: { title: site.title, url: site.finalUrl, wordCount: site.wordCount, loadTime: site.loadTime } })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: demo })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
      });
    }

    const client = new Anthropic({ apiKey });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

        send({ type: 'scrape', site: { title: site.title, url: site.finalUrl, wordCount: site.wordCount, loadTime: site.loadTime, technologies: site.technologies } });

        try {
          const anthropicStream = await client.messages.stream({
            model: 'claude-opus-4-8',
            max_tokens: 4000,
            system: 'You are an elite web analysis team. Be specific, expert, and reference actual data. Output structured sections exactly as instructed.',
            messages: [{ role: 'user', content: prompt }],
          });

          for await (const chunk of anthropicStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              send({ type: 'chunk', text: chunk.delta.text });
            }
          }

          send({ type: 'done' });
        } catch (err: unknown) {
          let msg = 'AI analysis failed. Please try again.';
          if (err instanceof Error) {
            if (err.message.includes('authentication') || err.message.includes('x-api-key') || err.message.includes('401')) {
              msg = 'Claude API key is invalid or not configured. Please set a valid ANTHROPIC_API_KEY in .env.local, or switch to Gemini 2.5 which is already configured.';
            } else if (err.message.includes('rate') || err.message.includes('429')) {
              msg = 'Claude API rate limit reached. Please wait a moment and try again, or switch to Gemini 2.5.';
            } else {
              msg = err.message.slice(0, 200);
            }
          }
          send({ type: 'error', message: msg });
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  }

  // OpenAI / Gemini provider stubs
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (provider === 'openai') {
    if (!openaiKey) return NextResponse.json({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY in .env.local' }, { status: 503 });
    // OpenAI Chat Completions via raw fetch (no SDK needed)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        send({ type: 'scrape', site: { title: site.title, url: site.finalUrl, wordCount: site.wordCount, loadTime: site.loadTime } });
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o',
              max_tokens: 4000,
              stream: true,
              messages: [
                { role: 'system', content: 'You are an elite web analysis team. Be specific. Output structured sections exactly as instructed.' },
                { role: 'user', content: prompt },
              ],
            }),
          });
          const reader = res.body?.getReader();
          const dec = new TextDecoder();
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = dec.decode(value).split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');
            for (const line of lines) {
              try {
                const json = JSON.parse(line.slice(6));
                const text = json.choices?.[0]?.delta?.content ?? '';
                if (text) send({ type: 'chunk', text });
              } catch { /* skip */ }
            }
          }
          send({ type: 'done' });
        } catch (err: unknown) {
          send({ type: 'error', message: err instanceof Error ? err.message : 'OpenAI error' });
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  if (provider === 'gemini') {
    if (!geminiKey) return NextResponse.json({ error: 'Gemini API key not configured. Set GEMINI_API_KEY in .env.local' }, { status: 503 });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        send({ type: 'scrape', site: { title: site.title, url: site.finalUrl, wordCount: site.wordCount, loadTime: site.loadTime } });
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `You are an elite web analysis team. Be specific. Output structured sections exactly as instructed.\n\n${prompt}` }] }],
              generationConfig: { maxOutputTokens: 8192 },
            }),
          });
          const reader = res.body?.getReader();
          const dec = new TextDecoder();
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = dec.decode(value).split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
              try {
                const json = JSON.parse(line.slice(6));
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                if (text) send({ type: 'chunk', text });
              } catch { /* skip */ }
            }
          }
          send({ type: 'done' });
        } catch (err: unknown) {
          send({ type: 'error', message: err instanceof Error ? err.message : 'Gemini error' });
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
  }

  return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
}
