import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { AuditReport, Suggestion } from '@/types/audit';

const client = new Anthropic();

const SuggestionSchema = z.object({
  id: z.string(),
  category: z.enum(['on-page', 'off-page', 'geo', 'aeo', 'performance', 'security', 'worldwide-seo']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  effortLevel: z.enum(['quick-win', 'moderate', 'major']),
  title: z.string(),
  description: z.string(),
  currentValue: z.string().nullable(),
  targetValue: z.string().nullable(),
  howToFix: z.record(z.string()),
  estimatedImpact: z.string(),
  relatedCheck: z.string(),
  aiGenerated: z.literal(true),
  readyToUseCode: z.string().nullable(),
  reasoning: z.string(),
});

const AISuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema).max(20),
  executiveSummary: z.string(),
  quickWinCount: z.number(),
  estimatedTimeToFix: z.string(),
});

export type AISuggestionsResponse = z.infer<typeof AISuggestionsResponseSchema>;

const STATIC_SYSTEM_CONTEXT = `You are an expert SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization) consultant with 10+ years of experience.

You analyze real website audits and generate highly specific, actionable improvement suggestions. Your suggestions are different from generic tools because:
1. You use the actual page content to write specific fix values — never generic templates
2. For missing meta descriptions: you write the actual meta description they should use
3. For FAQ schema: you generate complete JSON-LD with real questions from their page
4. For readyToUseCode: you provide paste-ready code the user can implement immediately
5. Your howToFix instructions are CMS-specific based on the detected platform
6. You reason about WHY each fix matters for this specific site, industry, and context

Respond ONLY with valid JSON matching the schema. Do not include markdown code fences.`;

function buildPrompt(report: AuditReport): string {
  return `Analyze this website audit and generate specific, actionable suggestions.

## Site Details
URL: ${report.url}
Detected CMS: ${report.detectedCms ?? 'Unknown'}
Industry: ${report.industryHint ?? 'Not specified'}
Audited: ${report.crawledAt}

## Current Scores
- Overall: ${report.overallScore}/100
- On-Page SEO: ${report.onPageScore}/100
- Off-Page SEO: ${report.offPageScore}/100
- GEO (AI search): ${report.geoScore}/100
- AEO (Answer engine): ${report.aeoScore}/100
- Worldwide SEO: ${report.worldwideSeoScore}/100
- PageSpeed Mobile: ${report.pagespeed?.mobile?.score ?? 0}/100
- Security: ${report.securityScore}/100

## Page Content Sample (first 1500 words)
${report.pageContent?.slice(0, 4000) ?? 'Not available'}

## Meta Tags Found
- Title: ${report.onPage?.metaTitle ?? '(missing)'}
- Description: ${report.onPage?.metaDescription ?? '(missing)'}
- H1: ${report.onPage?.h1 ?? '(missing)'}
- H2s: ${report.onPage?.h2s?.slice(0, 5).join(' | ') || '(none)'}

## Critical Issues Found
${JSON.stringify({
  noMetaTitle: !report.onPage?.metaTitle,
  noMetaDesc: !report.onPage?.metaDescription,
  noH1: !report.onPage?.h1,
  noCanonical: !report.onPage?.canonicalUrl,
  gptBotBlocked: !report.geo?.aiBotCrawlability.gpTBotAllowed,
  claudeBotBlocked: !report.geo?.aiBotCrawlability.claudeBotAllowed,
  noLlmsTxt: !report.geo?.aiBotCrawlability.hasLlmsTxt,
  noFAQSchema: !report.aeo?.hasFAQSchema,
  questionHeadings: report.aeo?.questionHeadingCount,
  noHtmlLang: !report.worldwideSeo?.htmlLang,
  noLocalBusiness: !report.worldwideSeo?.hasLocalBusiness,
  notHttps: !report.ssl?.httpsEnabled,
  securityGrade: report.ssl?.grade,
  imagesMissingAlt: report.onPage?.imagesMissingAlt,
  wordCount: report.onPage?.wordCount,
  socialProfilesMissing: Object.entries(report.offPage?.socialProfiles ?? {}).filter(([,v]) => !v).map(([k]) => k),
}, null, 2)}

## GEO Critical Blockers
${JSON.stringify(report.geo?.criticalBlockers ?? [], null, 2)}

## Task
Generate 8–15 highly specific suggestions for this exact site. Requirements:
1. Use the actual URL, page content, and meta tags to write specific values
2. For missing meta description: write the actual description they should use (based on their business/content)
3. For FAQ schema: generate the complete JSON-LD based on question headings found
4. For llms.txt: generate the actual file content
5. Ensure at least 2 GEO suggestions (AI search visibility) and 2 AEO suggestions (featured snippets)
6. howToFix must have entries for: wordpress, shopify, nextjs, ghl, generic
7. Sort by impact: critical blockers first, then quick-wins, then moderate effort
8. readyToUseCode: provide paste-ready HTML/JSON-LD for every code-related fix

Respond with JSON matching this exact schema:
{
  "suggestions": [/* array of suggestion objects */],
  "executiveSummary": "2-3 sentence plain English summary of the site's current state and biggest opportunities",
  "quickWinCount": /* number of quick-win suggestions */,
  "estimatedTimeToFix": "e.g. '2–3 hours for all critical and high items'"
}

Each suggestion must have:
{
  "id": "unique-string",
  "category": "on-page|off-page|geo|aeo|performance|security|worldwide-seo",
  "priority": "critical|high|medium|low",
  "effortLevel": "quick-win|moderate|major",
  "title": "specific title",
  "description": "explanation referencing this site's specific situation",
  "currentValue": "what we found (or null)",
  "targetValue": "what it should be",
  "howToFix": {"wordpress": "...", "shopify": "...", "nextjs": "...", "ghl": "...", "generic": "..."},
  "estimatedImpact": "specific impact estimate",
  "relatedCheck": "check-id",
  "aiGenerated": true,
  "readyToUseCode": "paste-ready code or null",
  "reasoning": "why this matters for this specific site"
}`;
}

export async function generateAISuggestions(report: AuditReport): Promise<AISuggestionsResponse> {
  const prompt = buildPrompt(report);

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 16000,
    thinking: { type: 'enabled', budget_tokens: 8000 },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: STATIC_SYSTEM_CONTEXT,
            cache_control: { type: 'ephemeral' },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  let parsed: AISuggestionsResponse;
  try {
    const raw = JSON.parse(textBlock.text);
    parsed = AISuggestionsResponseSchema.parse(raw);
  } catch (err) {
    console.error('Failed to parse AI suggestions response:', err);
    throw new Error('AI suggestions response was not valid JSON');
  }

  return parsed;
}

export function aiSuggestionsToSuggestions(aiResponse: AISuggestionsResponse): Suggestion[] {
  return aiResponse.suggestions.map((s) => ({
    ...s,
    aiGenerated: true as const,
  }));
}
