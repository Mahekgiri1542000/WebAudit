import type { CMSDetectionResult } from '@/types/audit';

export function detectCMS(html: string, headers: Record<string, string>): CMSDetectionResult {
  const signals: string[] = [];
  let detected: string | null = null;
  let confidence: CMSDetectionResult['confidence'] = 'low';

  const h = html.toLowerCase();

  // ─── WordPress ────────────────────────────────────────────────────────────
  if (h.includes('wp-content') || h.includes('wp-json') || h.includes('wp-includes')) {
    signals.push('wp-content/wp-json paths in HTML');
    const wpVersion = html.match(/WordPress (\d+\.\d+)/i)?.[1];
    detected = wpVersion ? `WordPress ${wpVersion}` : 'WordPress';
    confidence = 'high';
  } else if (h.includes('/wp-') && (h.includes('themes') || h.includes('plugins'))) {
    signals.push('WordPress theme/plugin paths');
    detected = 'WordPress';
    confidence = 'medium';
  }

  // ─── Shopify ─────────────────────────────────────────────────────────────
  if (!detected && (h.includes('cdn.shopify.com') || h.includes('myshopify.com') || h.includes('shopify.com/s/'))) {
    signals.push('Shopify CDN URLs');
    detected = 'Shopify';
    confidence = 'high';
  }

  // ─── Next.js ─────────────────────────────────────────────────────────────
  if (!detected && (h.includes('__next_data__') || h.includes('_next/static'))) {
    signals.push('__NEXT_DATA__ / _next/static in HTML');
    detected = 'Next.js';
    confidence = 'high';
  }

  // ─── React (generic) ─────────────────────────────────────────────────────
  if (!detected && (h.includes('react') && (h.includes('id="root"') || h.includes("id='root'")))) {
    signals.push('React root div');
    detected = 'React';
    confidence = 'medium';
  }

  // ─── GoHighLevel ─────────────────────────────────────────────────────────
  if (!detected && (h.includes('gohighlevel') || h.includes('highlevel') || h.includes('msgsndr.com'))) {
    signals.push('GoHighLevel script domains');
    detected = 'GoHighLevel';
    confidence = 'high';
  }

  // ─── Webflow ─────────────────────────────────────────────────────────────
  if (!detected && h.includes('webflow.com')) {
    signals.push('Webflow CDN');
    detected = 'Webflow';
    confidence = 'high';
  }

  // ─── Wix ─────────────────────────────────────────────────────────────────
  if (!detected && (h.includes('static.wixstatic.com') || h.includes('wix.com'))) {
    signals.push('Wix CDN');
    detected = 'Wix';
    confidence = 'high';
  }

  // ─── Squarespace ─────────────────────────────────────────────────────────
  if (!detected && h.includes('squarespace.com')) {
    signals.push('Squarespace CDN');
    detected = 'Squarespace';
    confidence = 'high';
  }

  // ─── X-Powered-By header ─────────────────────────────────────────────────
  const poweredBy = headers['x-powered-by']?.toLowerCase() ?? '';
  if (!detected && poweredBy) {
    if (poweredBy.includes('express')) { detected = 'Node.js (Express)'; signals.push('X-Powered-By: Express'); confidence = 'medium'; }
    else if (poweredBy.includes('php')) { detected = 'PHP'; signals.push('X-Powered-By: PHP'); confidence = 'medium'; }
    else if (poweredBy.includes('next')) { detected = 'Next.js'; signals.push('X-Powered-By: Next.js'); confidence = 'high'; }
  }

  const generator = html.match(/<meta[^>]+name="generator"[^>]+content="([^"]+)"/i)?.[1];
  if (generator && !detected) {
    signals.push(`Generator meta: ${generator}`);
    detected = generator;
    confidence = 'medium';
  }

  return { detected, confidence, signals };
}
