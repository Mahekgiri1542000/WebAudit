// ─── Shared check item ────────────────────────────────────────────────────────

export type CheckSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CheckStatus = 'pass' | 'warn' | 'fail' | 'skip';

export type CheckItem = {
  id: string;
  title: string;
  status: CheckStatus;
  severity: CheckSeverity;
  value: string | null;
  note: string;
};

// ─── Suggestion ───────────────────────────────────────────────────────────────

export type SuggestionCategory =
  | 'on-page'
  | 'off-page'
  | 'geo'
  | 'aeo'
  | 'performance'
  | 'security'
  | 'worldwide-seo';

export type Suggestion = {
  id: string;
  category: SuggestionCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effortLevel: 'quick-win' | 'moderate' | 'major';
  title: string;
  description: string;
  currentValue: string | null;
  targetValue: string | null;
  howToFix: Record<string, string>;
  estimatedImpact: string;
  relatedCheck: string;
  aiGenerated?: boolean;
  readyToUseCode?: string | null;
  reasoning?: string;
};

// ─── Module results ───────────────────────────────────────────────────────────

export type OnPageSEOResult = {
  score: number;
  checks: CheckItem[];
  metaTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  h2s: string[];
  canonicalUrl: string | null;
  robots: string | null;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  wordCount: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
};

export type OffPageSEOResult = {
  score: number;
  checks: CheckItem[];
  hasGbpLink: boolean;
  socialProfiles: Record<string, boolean>;
  hasNAP: boolean;
  hasShareableOG: boolean;
};

export type GEOResult = {
  geoScore: number;
  eeaTScore: number;
  entityScore: number;
  crawlabilityScore: number;
  contentQualityScore: number;
  checks: CheckItem[];
  criticalBlockers: string[];
  aiBotCrawlability: {
    gpTBotAllowed: boolean;
    claudeBotAllowed: boolean;
    perplexityAllowed: boolean;
    googleAIOAllowed: boolean;
    hasLlmsTxt: boolean;
  };
};

export type AEOResult = {
  aeoScore: number;
  featuredSnippetScore: number;
  faqScore: number;
  voiceSearchScore: number;
  topicalAuthorityScore: number;
  checks: CheckItem[];
  questionHeadingCount: number;
  hasFAQSchema: boolean;
  hasHowToSchema: boolean;
  hasSpeakable: boolean;
};

export type WorldwideSEOResult = {
  score: number;
  checks: CheckItem[];
  htmlLang: string | null;
  hreflangCount: number;
  hreflangIssues: string[];
  hasLocalBusiness: boolean;
  urlStructure: 'cctld' | 'subdomain' | 'subdirectory' | 'none';
  napConsistent: boolean;
  hasGbpLink: boolean;
};

export type PageSpeedResult = {
  score: number;
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  fcp: number | null;
  speedIndex: number | null;
  opportunities: Array<{ title: string; savings: string }>;
};

export type MalwareResult = {
  status: 'clean' | 'suspicious' | 'infected' | 'inconclusive' | 'error';
  safeBrowsing: boolean | null;
  virusTotal: boolean | null;
  checks: CheckItem[];
};

export type SSLResult = {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  httpsEnabled: boolean;
  certValid: boolean;
  certExpiresAt: string | null;
  daysUntilExpiry: number | null;
  headers: Record<string, boolean>;
  checks: CheckItem[];
};

export type CMSDetectionResult = {
  detected: string | null;
  confidence: 'high' | 'medium' | 'low';
  signals: string[];
};

export type ConfidenceResult = {
  confidenceScore: number;
  factors: Array<{ name: string; impact: number; note: string }>;
};

// ─── Full audit report ────────────────────────────────────────────────────────

export type AuditReport = {
  url: string;
  crawledAt: string;
  detectedCms: string | null;
  industryHint: string | null;
  pageContent: string | null;

  onPage: OnPageSEOResult;
  offPage: OffPageSEOResult;
  geo: GEOResult;
  aeo: AEOResult;
  worldwideSeo: WorldwideSEOResult;
  pagespeed: {
    mobile: PageSpeedResult;
    desktop: PageSpeedResult;
  };
  malware: MalwareResult;
  ssl: SSLResult;
  cms: CMSDetectionResult;
  confidence: ConfidenceResult;

  overallScore: number;
  onPageScore: number;
  offPageScore: number;
  geoScore: number;
  aeoScore: number;
  worldwideSeoScore: number;
  pageSpeedScore: number;
  securityScore: number;
};

// ─── Score label ──────────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent — maintain and monitor';
  if (score >= 75) return 'Good — minor improvements available';
  if (score >= 60) return 'Average — some key fixes needed';
  if (score >= 40) return 'Below average — significant issues found';
  return 'Needs urgent attention';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}
