import dns from 'dns/promises';
import { isIP } from 'net';

// RFC 1918 + loopback + link-local + metadata service ranges
const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,       // AWS/GCP metadata
  /^0\./,
  /^::1$/,             // IPv6 loopback
  /^fc00:/,            // IPv6 ULA
  /^fe80:/,            // IPv6 link-local
  /^fd/,
];

export function isPrivateIP(ip: string): boolean {
  return PRIVATE_RANGES.some((rx) => rx.test(ip));
}

export async function validateAuditUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http:// and https:// URLs are allowed');
  }

  // Block localhost by hostname
  const hostname = url.hostname.toLowerCase();
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) {
    throw new Error('Localhost and internal addresses are not allowed');
  }

  // If the hostname is already an IP address, check it directly
  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new Error('Private/internal IP addresses are not allowed');
    }
    return url;
  }

  // DNS pre-resolution — prevents DNS rebinding attacks
  let resolved: string[];
  try {
    resolved = await dns.resolve4(hostname);
  } catch {
    try {
      const v6 = await dns.resolve6(hostname);
      for (const ip of v6) {
        if (isPrivateIP(ip)) {
          throw new Error('Domain resolves to private/internal IPv6 address');
        }
      }
      return url;
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('private')) throw e;
      throw new Error(`Cannot resolve hostname: ${hostname}`);
    }
  }

  for (const ip of resolved) {
    if (isPrivateIP(ip)) {
      throw new Error(`Domain ${hostname} resolves to private IP ${ip} — not allowed`);
    }
  }

  return url;
}
