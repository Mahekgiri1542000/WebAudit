import { PlanTier } from '@prisma/client';

export type PlanFeatures = {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  auditsPerMonth: number;    // -1 = unlimited
  monitoredSites: number;    // -1 = unlimited
  keywordsPerSite: number;
  historyDays: number;
  emailAlerts: boolean;
  rankingTracker: boolean;
  aiSuggestions: boolean;
  shareableReport: boolean;
  dualMalware: boolean;
  competitorTracking: boolean;
  pdfExport: boolean;        // PDF report download
  docExport: boolean;        // Word DOC report download
  aiReport: boolean;         // AI executive summary in exports
  stripePriceId: string | null;
};

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    priceMonthly: 0,
    auditsPerMonth: 3,
    monitoredSites: 1,
    keywordsPerSite: 3,
    historyDays: 7,
    emailAlerts: false,
    rankingTracker: false,
    aiSuggestions: false,
    shareableReport: false,
    dualMalware: false,
    competitorTracking: false,
    pdfExport: false,
    docExport: false,
    aiReport: false,
    stripePriceId: null,
  },
  STARTER: {
    tier: 'STARTER',
    name: 'Starter',
    priceMonthly: 1900,
    auditsPerMonth: 25,
    monitoredSites: 3,
    keywordsPerSite: 10,
    historyDays: 30,
    emailAlerts: true,
    rankingTracker: false,
    aiSuggestions: false,
    shareableReport: true,
    dualMalware: false,
    competitorTracking: false,
    pdfExport: false,
    docExport: true,
    aiReport: false,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null,
  },
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    priceMonthly: 4900,
    auditsPerMonth: 100,
    monitoredSites: 10,
    keywordsPerSite: 25,
    historyDays: 90,
    emailAlerts: true,
    rankingTracker: true,
    aiSuggestions: true,
    shareableReport: true,
    dualMalware: true,
    competitorTracking: false,
    pdfExport: true,
    docExport: true,
    aiReport: true,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
  },
  AGENCY: {
    tier: 'AGENCY',
    name: 'Agency',
    priceMonthly: 9900,
    auditsPerMonth: -1,
    monitoredSites: -1,
    keywordsPerSite: 50,
    historyDays: 365,
    emailAlerts: true,
    rankingTracker: true,
    aiSuggestions: true,
    shareableReport: true,
    dualMalware: true,
    competitorTracking: true,
    pdfExport: true,
    docExport: true,
    aiReport: true,
    stripePriceId: process.env.STRIPE_PRICE_AGENCY ?? null,
  },
};

export function getPlanByPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(PLAN_FEATURES)) {
    if (plan.stripePriceId === priceId) return tier as PlanTier;
  }
  return null;
}

export function canUseFeature(tier: PlanTier, feature: keyof PlanFeatures): boolean {
  const plan = PLAN_FEATURES[tier];
  const value = plan[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === -1 || value > 0;
  return false;
}
