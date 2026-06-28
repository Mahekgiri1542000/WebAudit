import { Queue } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';

// ─── Queue names ─────────────────────────────────────────────────────────────

export const AUDIT_QUEUE = 'audits';
export const AI_SUGGESTIONS_QUEUE = 'ai-suggestions';
export const MONITOR_QUEUE = 'monitor';
export const CLEANUP_QUEUE = 'cleanup';

// ─── Job type payloads ────────────────────────────────────────────────────────

export type AuditJobPayload = {
  auditId: string;
  userId: string;
  url: string;
  platformHint: string;
  industryHint?: string;
};

export type AISuggestionsJobPayload = {
  auditId: string;
  userId: string;
};

export type MonitorJobPayload = {
  monitoredSiteId: string;
  userId: string;
};

// ─── Connection ───────────────────────────────────────────────────────────────

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL;
  if (!url || url.includes('REPLACE_ME') || url.includes('localhost')) return null;
  return url;
}

function makeConnection(url: string): ConnectionOptions {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || '6379', 10),
    username: u.username || undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    db: parseInt(u.pathname.slice(1) || '0', 10) || 0,
    tls: url.startsWith('rediss://') ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  } as ConnectionOptions;
}

const REDIS_URL = getRedisUrl();
export const REDIS_AVAILABLE = !!REDIS_URL;
export const connection: ConnectionOptions | null = REDIS_URL ? makeConnection(REDIS_URL) : null;

// ─── Queue instances (null when Redis not configured) ─────────────────────────

export const auditQueue = REDIS_AVAILABLE && connection ? new Queue(AUDIT_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
}) : null;

export const aiSuggestionsQueue = REDIS_AVAILABLE && connection ? new Queue(AI_SUGGESTIONS_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 10000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 100 },
  },
}) : null;

export const monitorQueue = REDIS_AVAILABLE && connection ? new Queue(MONITOR_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 30000 },
  },
}) : null;

export const cleanupQueue = REDIS_AVAILABLE && connection ? new Queue(CLEANUP_QUEUE, {
  connection,
  defaultJobOptions: { attempts: 1, removeOnComplete: true },
}) : null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function enqueueAudit(payload: AuditJobPayload) {
  if (!auditQueue) throw new Error('Redis not configured — set REDIS_URL to enable background workers');
  return auditQueue.add('run-audit', payload, { jobId: `audit:${payload.auditId}` });
}

export async function enqueueAISuggestions(payload: AISuggestionsJobPayload) {
  if (!aiSuggestionsQueue) throw new Error('Redis not configured');
  return aiSuggestionsQueue.add('generate-suggestions', payload, {
    jobId: `ai:${payload.auditId}`,
    delay: 1000,
  });
}
