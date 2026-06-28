type SerpAPIResult = {
  organic_results?: Array<{ link: string; position: number }>;
  answer_box?: { link?: string; snippet?: string };
  ai_overview?: { sources?: Array<{ link: string }> };
  local_results?: { places?: Array<{ title: string; rating?: number; links?: { website?: string } }> };
  related_questions?: Array<{ question: string }>;
  knowledge_graph?: Record<string, unknown>;
  sitelinks?: Record<string, unknown>;
  shopping_results?: unknown[];
  images_results?: unknown[];
  video_results?: unknown[];
};

type SERPFeatures = {
  featuredSnippet: { present: boolean; ownedBySite: boolean; content: string | null; sourceUrl: string | null };
  aiOverview: { present: boolean; ownedBySite: boolean; citedUrls: string[] };
  localPack: { present: boolean; businessListed: boolean; listings: Array<{ name: string; rating: number | null }> };
  peopleAlsoAsk: { present: boolean; questions: string[] };
  shoppingResults: boolean;
  imageCarousel: boolean;
  videoCarousel: boolean;
  knowledgePanel: boolean;
  sitelinks: boolean;
};

export type RankResult = {
  keyword: string;
  country: string;
  language: string;
  device: string;
  position: number | null;
  serpFeatures: SERPFeatures;
  checkedAt: Date;
};

function normalizeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^www\./, '');
  }
}

function findPosition(results: Array<{ link: string; position?: number }>, domain: string): number | null {
  const idx = results.findIndex((r) => normalizeDomain(r.link) === domain);
  return idx === -1 ? null : idx + 1;
}

function extractSerpFeatures(data: SerpAPIResult, targetDomain: string): SERPFeatures {
  return {
    featuredSnippet: {
      present: !!data.answer_box,
      ownedBySite: data.answer_box?.link ? normalizeDomain(data.answer_box.link) === targetDomain : false,
      content: data.answer_box?.snippet ?? null,
      sourceUrl: data.answer_box?.link ?? null,
    },
    aiOverview: {
      present: !!data.ai_overview,
      ownedBySite: (data.ai_overview?.sources ?? []).some((s) => normalizeDomain(s.link) === targetDomain),
      citedUrls: (data.ai_overview?.sources ?? []).map((s) => s.link),
    },
    localPack: {
      present: !!data.local_results,
      businessListed: (data.local_results?.places ?? []).some(
        (p) => p.links?.website && normalizeDomain(p.links.website) === targetDomain
      ),
      listings: (data.local_results?.places ?? []).slice(0, 3).map((p) => ({
        name: p.title,
        rating: p.rating ?? null,
      })),
    },
    peopleAlsoAsk: {
      present: !!data.related_questions,
      questions: (data.related_questions ?? []).map((q) => q.question),
    },
    shoppingResults: !!data.shopping_results?.length,
    imageCarousel: !!data.images_results,
    videoCarousel: !!data.video_results,
    knowledgePanel: !!data.knowledge_graph,
    sitelinks: !!data.sitelinks,
  };
}

export async function checkRanking(
  keyword: string,
  targetDomain: string,
  country = 'us',
  language = 'en',
  device: 'desktop' | 'mobile' = 'desktop'
): Promise<RankResult> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    return {
      keyword,
      country,
      language,
      device,
      position: null,
      serpFeatures: {
        featuredSnippet: { present: false, ownedBySite: false, content: null, sourceUrl: null },
        aiOverview: { present: false, ownedBySite: false, citedUrls: [] },
        localPack: { present: false, businessListed: false, listings: [] },
        peopleAlsoAsk: { present: false, questions: [] },
        shoppingResults: false,
        imageCarousel: false,
        videoCarousel: false,
        knowledgePanel: false,
        sitelinks: false,
      },
      checkedAt: new Date(),
    };
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: keyword,
    gl: country,
    hl: language,
    device,
    num: '100',
    api_key: apiKey,
  });

  try {
    const res = await fetch(`https://serpapi.com/search?${params}`, {
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`SerpAPI returned ${res.status}`);
    const data = (await res.json()) as SerpAPIResult;

    const domain = normalizeDomain(targetDomain);
    const organic = data.organic_results ?? [];

    return {
      keyword,
      country,
      language,
      device,
      position: findPosition(organic, domain),
      serpFeatures: extractSerpFeatures(data, domain),
      checkedAt: new Date(),
    };
  } catch (err) {
    console.error('SerpAPI error:', err);
    throw err;
  }
}

export function computeVolatility(positions: (number | null)[]): {
  volatility: 'stable' | 'moderate' | 'high';
  trend: 'up' | 'down' | 'flat';
  avg: number;
} {
  const nonNull = positions.filter((p): p is number => p !== null);
  if (nonNull.length < 2) return { volatility: 'stable', trend: 'flat', avg: nonNull[0] ?? 0 };

  const avg = nonNull.reduce((a, b) => a + b, 0) / nonNull.length;
  const stdDev = Math.sqrt(
    nonNull.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / nonNull.length
  );

  const first = nonNull[0];
  const last = nonNull[nonNull.length - 1];

  return {
    volatility: stdDev < 2 ? 'stable' : stdDev < 5 ? 'moderate' : 'high',
    trend: last < first ? 'up' : last > first ? 'down' : 'flat',
    avg: Math.round(avg),
  };
}
