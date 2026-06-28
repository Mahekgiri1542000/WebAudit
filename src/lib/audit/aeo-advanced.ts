import * as cheerio from 'cheerio';
import type { AEOResult, CheckItem } from '@/types/audit';

export async function runAEO(html: string, _url: string): Promise<AEOResult> {
  const $ = cheerio.load(html);
  const checks: CheckItem[] = [];

  const mainContent = $('main, article, .content, body').first().text().replace(/\s+/g, ' ');

  // ─── JSON-LD blocks ────────────────────────────────────────────────────────
  const ldJsonBlocks = $('script[type="application/ld+json"]')
    .map((_, el) => { try { return JSON.parse($(el).html() ?? '{}'); } catch { return {}; } })
    .get() as Record<string, unknown>[];

  const faqSchema = ldJsonBlocks.find((b) => b['@type'] === 'FAQPage');
  const howToSchema = ldJsonBlocks.find((b) => b['@type'] === 'HowTo');
  const speakableSchema = ldJsonBlocks.find((b) => b.speakable);

  // ─── FAQ Schema ────────────────────────────────────────────────────────────
  checks.push({
    id: 'faq-schema',
    title: 'FAQ Schema (FAQPage)',
    status: faqSchema ? 'pass' : 'warn',
    severity: 'high',
    value: faqSchema ? `${(faqSchema.mainEntity as unknown[])?.length ?? 0} Q&A pairs` : null,
    note: faqSchema
      ? `FAQ schema with ${(faqSchema.mainEntity as unknown[])?.length ?? 0} items — eligible for featured snippet rich results`
      : 'No FAQ schema — add FAQPage schema to qualify for featured snippet and PAA inclusion',
  });

  // ─── HowTo Schema ─────────────────────────────────────────────────────────
  checks.push({
    id: 'howto-schema',
    title: 'HowTo Schema',
    status: howToSchema ? 'pass' : 'warn',
    severity: 'medium',
    value: howToSchema ? `${(howToSchema.step as unknown[])?.length ?? 0} steps` : null,
    note: howToSchema
      ? 'HowTo schema found — eligible for rich results in How-to queries'
      : 'No HowTo schema — if you have step-by-step content, add HowTo schema',
  });

  // ─── Speakable Schema (voice search) ──────────────────────────────────────
  checks.push({
    id: 'speakable-schema',
    title: 'Speakable Schema (Voice Search)',
    status: speakableSchema ? 'pass' : 'warn',
    severity: 'low',
    value: speakableSchema ? 'Present' : null,
    note: speakableSchema
      ? 'Speakable schema found — content is marked up for Google Assistant voice responses'
      : 'No Speakable schema — add it to mark your best answer paragraphs for voice search',
  });

  // ─── Question-format headings (Featured snippet + PAA signals) ────────────
  const headings = $('h1, h2, h3, h4').map((_, el) => ({
    text: $(el).text().trim(),
    isQuestion: /^(what|how|why|when|who|which|can|does|is|are|will|should|where)/i.test($(el).text().trim()),
    nextParagraphWords: $(el).next('p').text().trim().split(/\s+/).length,
  })).get();

  const questionHeadings = headings.filter((h) => h.isQuestion);
  const questionHeadingCount = questionHeadings.length;

  checks.push({
    id: 'question-headings',
    title: 'Question-Format Headings (PAA Alignment)',
    status: questionHeadingCount >= 3 ? 'pass' : questionHeadingCount >= 1 ? 'warn' : 'fail',
    severity: 'high',
    value: `${questionHeadingCount} question headings`,
    note:
      questionHeadingCount >= 3
        ? `${questionHeadingCount} question-format headings found — strong PAA alignment signal`
        : questionHeadingCount === 0
          ? 'No question headings — restructure H2/H3 tags as questions to target People Also Ask'
          : `${questionHeadingCount} question heading(s) — aim for 3+ matching your target PAA questions`,
  });

  // ─── Direct answer paragraphs (40–60 words = ideal snippet length) ─────────
  const directAnswers = questionHeadings.filter(
    (h) => h.nextParagraphWords >= 30 && h.nextParagraphWords <= 80
  );
  checks.push({
    id: 'direct-answer-paragraphs',
    title: 'Direct Answer Paragraphs',
    status: directAnswers.length >= 2 ? 'pass' : directAnswers.length >= 1 ? 'warn' : 'fail',
    severity: 'high',
    value: `${directAnswers.length} of ${questionHeadings.length} questions have ideal-length answers`,
    note:
      directAnswers.length >= 2
        ? 'Well-structured answers — Google can extract featured snippets from these'
        : 'Answers too long/short — featured snippets prefer 40–60 word answer paragraphs directly below the question heading',
  });

  // ─── Definition blocks ────────────────────────────────────────────────────
  const hasDefinitionBlock = /^[A-Z][^.]{5,} is (a|an|the) [^.]{5,}\./m.test(mainContent);
  checks.push({
    id: 'definition-blocks',
    title: 'Definition Blocks',
    status: hasDefinitionBlock ? 'pass' : 'warn',
    severity: 'low',
    value: hasDefinitionBlock ? 'Found' : null,
    note: hasDefinitionBlock
      ? 'Definition-format sentences found — good for "What is X" featured snippets'
      : 'No definition blocks — add concise "X is a Y that Z" sentences for definition queries',
  });

  // ─── FAQ content without schema (opportunity) ────────────────────────────
  const faqContentDetected =
    $('details > summary').length > 0 ||
    $('[class*="faq"]').length > 0 ||
    $('[id*="faq"]').length > 0 ||
    questionHeadings.length >= 3;

  const faqSchemaOpportunity = faqContentDetected && !faqSchema;
  if (faqSchemaOpportunity) {
    checks.push({
      id: 'faq-schema-opportunity',
      title: 'FAQ Content Without Schema',
      status: 'warn',
      severity: 'high',
      value: 'FAQ content found but no FAQPage schema',
      note: 'FAQ-style content detected but no FAQPage schema — adding schema takes 5 minutes and qualifies for rich results',
    });
  }

  // ─── Numbered/ordered lists (list featured snippets) ─────────────────────
  const numberedLists = $('ol').length;
  const bulletLists = $('ul').length;
  checks.push({
    id: 'list-content',
    title: 'Lists for Featured Snippets',
    status: numberedLists + bulletLists >= 2 ? 'pass' : 'warn',
    severity: 'medium',
    value: `${numberedLists} ordered, ${bulletLists} unordered lists`,
    note:
      numberedLists + bulletLists >= 2
        ? 'List content found — eligible for list-type featured snippets'
        : 'Few lists — numbered and bulleted lists are frequently featured in snippet results',
  });

  // ─── Comparison tables (table featured snippets) ──────────────────────────
  const tableCount = $('table').length;
  checks.push({
    id: 'comparison-tables',
    title: 'Comparison Tables',
    status: tableCount > 0 ? 'pass' : 'warn',
    severity: 'low',
    value: tableCount > 0 ? `${tableCount} table(s)` : null,
    note: tableCount > 0 ? 'Tables present — eligible for table-type featured snippets' : 'No tables — add comparison tables for "vs" and comparison queries',
  });

  // ─── Breadcrumbs (topical depth signal) ──────────────────────────────────
  const hasBreadcrumbs =
    $('nav[aria-label*="breadcrumb"], [class*="breadcrumb"]').length > 0 ||
    ldJsonBlocks.some((b) => b['@type'] === 'BreadcrumbList');

  checks.push({
    id: 'breadcrumbs',
    title: 'Breadcrumb Navigation',
    status: hasBreadcrumbs ? 'pass' : 'warn',
    severity: 'low',
    value: hasBreadcrumbs ? 'Present' : null,
    note: hasBreadcrumbs ? 'Breadcrumbs found — signals topical depth to search engines' : 'No breadcrumbs — add breadcrumb navigation to signal content hierarchy',
  });

  // ─── Internal topical links ───────────────────────────────────────────────
  const internalLinkCount = $('a[href^="/"]').length;
  checks.push({
    id: 'topical-links',
    title: 'Internal Topic Cluster Links',
    status: internalLinkCount >= 5 ? 'pass' : internalLinkCount >= 2 ? 'warn' : 'fail',
    severity: 'medium',
    value: `${internalLinkCount} internal links`,
    note:
      internalLinkCount >= 5
        ? 'Good internal linking — signals topical authority'
        : 'Few internal links — link to related pages to build topic cluster authority',
  });

  // ─── Score computation ─────────────────────────────────────────────────────
  const snippetChecks = checks.filter((c) =>
    ['question-headings', 'direct-answer-paragraphs', 'definition-blocks', 'list-content', 'comparison-tables'].includes(c.id)
  );
  const faqChecks = checks.filter((c) =>
    ['faq-schema', 'howto-schema', 'faq-schema-opportunity'].includes(c.id)
  );
  const voiceChecks = checks.filter((c) =>
    ['speakable-schema', 'question-headings'].includes(c.id)
  );
  const authorityChecks = checks.filter((c) =>
    ['breadcrumbs', 'topical-links'].includes(c.id)
  );

  const featuredSnippetScore = Math.round(
    (snippetChecks.filter((c) => c.status === 'pass').length / snippetChecks.length) * 100
  );
  const faqScore = Math.round(
    (faqChecks.filter((c) => c.status === 'pass').length / faqChecks.length) * 100
  );
  const voiceSearchScore = Math.round(
    (voiceChecks.filter((c) => c.status === 'pass').length / voiceChecks.length) * 100
  );
  const topicalAuthorityScore = Math.round(
    (authorityChecks.filter((c) => c.status === 'pass').length / authorityChecks.length) * 100
  );

  const aeoScore = Math.round(
    featuredSnippetScore * 0.30 +
    faqScore * 0.25 +
    voiceSearchScore * 0.25 +
    topicalAuthorityScore * 0.20
  );

  return {
    aeoScore,
    featuredSnippetScore,
    faqScore,
    voiceSearchScore,
    topicalAuthorityScore,
    checks,
    questionHeadingCount,
    hasFAQSchema: !!faqSchema,
    hasHowToSchema: !!howToSchema,
    hasSpeakable: !!speakableSchema,
  };
}
