import type { ScrapedSite } from './scraper';

export function buildAnalysisPrompt(site: ScrapedSite): string {
  return `You are an elite team of experts: Senior UX Designer, Creative Director, Brand Strategist, SEO Expert, Conversion Rate Optimization Specialist, Accessibility Expert, and Frontend Architect.

Analyze this website and produce a comprehensive, enterprise-grade analysis.

## WEBSITE DATA

URL: ${site.finalUrl}
Status: ${site.statusCode}
Load time: ${site.loadTime}ms
HTTPS: ${site.hasHttps}
Language: ${site.lang || 'not set'}

### SEO Signals
Title: ${site.title || 'MISSING'}
Meta Description: ${site.metaDescription || 'MISSING'}
Canonical URL: ${site.canonicalUrl || 'not set'}
Robots: ${site.robots || 'not set'}

### Open Graph
OG Title: ${site.ogTitle || 'MISSING'}
OG Description: ${site.ogDescription || 'MISSING'}
OG Image: ${site.ogImage || 'MISSING'}
OG Type: ${site.ogType || 'not set'}

### Twitter Cards
Twitter Card: ${site.twitterCard || 'MISSING'}
Twitter Title: ${site.twitterTitle || 'MISSING'}

### Headings Structure
H1s: ${site.h1.join(' | ') || 'NONE'}
H2s: ${site.h2.join(' | ') || 'NONE'}
H3s: ${site.h3.join(' | ') || 'NONE'}

### Navigation
Nav items: ${site.navItems.join(', ') || 'not detected'}

### Content
Word count: ${site.wordCount}
Body preview: ${site.bodyText.slice(0, 1000)}

### CTAs & Conversion
CTA texts found: ${site.ctaTexts.join(' | ') || 'none detected'}
Forms: ${site.formCount}
Has search: ${site.hasSearch}
Has newsletter: ${site.hasNewsletter}
Has live chat: ${site.hasChatWidget}

### Technical
Images total: ${site.imageCount}
Images without alt: ${site.imagesWithoutAlt}
Internal links: ${site.internalLinks}
External links: ${site.externalLinks}
Schema types: ${site.schemaTypes.join(', ') || 'none'}
Technologies detected: ${site.technologies.join(', ') || 'not detected'}

### Social & Footer
Social links: ${site.socialLinks.join(', ') || 'none'}
Footer links: ${site.footerLinks.join(', ') || 'none'}

### Response Headers
${Object.entries(site.headers).filter(([k]) => ['content-security-policy','strict-transport-security','x-frame-options','x-content-type-options','referrer-policy','permissions-policy'].includes(k)).map(([k,v]) => `${k}: ${v}`).join('\n') || 'No security headers detected'}

---

## YOUR TASK

Produce a thorough analysis covering every dimension below. For each category, give a score 0-100, key findings (both positives and issues), and specific, actionable recommendations with code examples where applicable.

Output your analysis in this EXACT format (use the === markers so the UI can parse sections):

===EXECUTIVE_SUMMARY===
Write 3-4 sentences. Overall health of the website. Top 3 strengths. Top 3 most critical issues to fix first.

===SCORES===
{
  "overall": <0-100>,
  "seo": <0-100>,
  "ux": <0-100>,
  "brand": <0-100>,
  "content": <0-100>,
  "performance": <0-100>,
  "accessibility": <0-100>,
  "conversion": <0-100>,
  "technical": <0-100>,
  "mobile": <0-100>
}

===SEO_ANALYSIS===
**Score: X/100**

**What's Working:**
- [positive finding]

**Critical Issues:**
- [issue with specific fix]

**Recommendations:**
1. [specific, actionable recommendation]
2. [with code example if applicable]

===UX_ANALYSIS===
**Score: X/100**

**Navigation & Information Architecture:**
[analysis]

**User Journey:**
[analysis]

**What's Working:**
- [positives]

**Issues Found:**
- [issues]

**Recommendations:**
1. [specific recommendation]

===BRAND_ANALYSIS===
**Score: X/100**

**Brand Identity Assessment:**
[analysis of brand consistency, personality, tone]

**Visual Design:**
[analysis of typography, color, spacing, hierarchy]

**What's Working:**
- [positives]

**Issues Found:**
- [issues]

**Recommendations:**
1. [specific recommendation]

===CONTENT_ANALYSIS===
**Score: X/100**

**Content Quality & Strategy:**
[analysis]

**Messaging Clarity:**
[analysis]

**What's Working:**
- [positives]

**Issues Found:**
- [issues]

**Recommendations:**
1. [specific recommendation]

===PERFORMANCE_ANALYSIS===
**Score: X/100**

**Technical Performance:**
[analysis based on load time, technology stack, etc.]

**What's Working:**
- [positives]

**Critical Issues:**
- [issues with specific fixes]

**Recommendations:**
1. [specific recommendation with code if applicable]

===ACCESSIBILITY_ANALYSIS===
**Score: X/100**

**WCAG Compliance Assessment:**
[analysis]

**Issues Found:**
- [specific issues — e.g., ${site.imagesWithoutAlt} images without alt text]

**Recommendations:**
1. [specific fix with code example]

===CONVERSION_ANALYSIS===
**Score: X/100**

**Conversion Funnel Assessment:**
[analysis of CTAs, forms, trust signals, social proof]

**What's Working:**
- [positives]

**Issues Found:**
- [issues]

**Recommendations:**
1. [specific recommendation]

===TECHNICAL_ANALYSIS===
**Score: X/100**

**Security Headers:**
[assessment of headers found]

**Schema & Structured Data:**
[assessment]

**Open Graph & Social:**
[assessment]

**Issues Found:**
- [specific issues]

**Recommendations:**
1. [specific recommendation with code]
\`\`\`html
<!-- Example schema markup or header to add -->
\`\`\`

===QUICK_WINS===
List the top 5 highest-impact, lowest-effort fixes that can be implemented today:

1. **[Action]** — Impact: High | Effort: Low | [specific instruction]
2. **[Action]** — Impact: High | Effort: Low | [specific instruction]
3. **[Action]** — Impact: High | Effort: Low | [specific instruction]
4. **[Action]** — Impact: High | Effort: Low | [specific instruction]
5. **[Action]** — Impact: High | Effort: Low | [specific instruction]

===ROADMAP===
**30-Day Priority Actions:**
1. [action]

**60-Day Improvements:**
1. [action]

**90-Day Strategic Goals:**
1. [action]

===END===

Be specific, expert, and direct. Reference actual data from the website (real titles, actual missing headers, etc.). Don't be generic.`;
}
