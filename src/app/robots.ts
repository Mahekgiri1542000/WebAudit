import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://webaudit.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/print/',
          '/_next/',
        ],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Googlebot-Extended'],
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/print/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
