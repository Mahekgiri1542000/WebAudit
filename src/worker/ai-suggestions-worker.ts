import { Worker } from 'bullmq';
import { connection, AI_SUGGESTIONS_QUEUE, type AISuggestionsJobPayload } from '@/lib/queue';
import { db } from '@/lib/db';
import { generateAISuggestions, aiSuggestionsToSuggestions } from '@/lib/audit/ai-suggestions';
import type { AuditReport } from '@/types/audit';

const worker = new Worker<AISuggestionsJobPayload>(
  AI_SUGGESTIONS_QUEUE,
  async (job) => {
    const { auditId } = job.data;
    console.log(`[ai-suggestions-worker] Generating AI suggestions for audit ${auditId}`);

    // Mark AI suggestions as running
    await db.audit.update({
      where: { id: auditId },
      data: { aiSuggestionsStatus: 'running' },
    });

    try {
      const audit = await db.audit.findUnique({
        where: { id: auditId },
        select: { report: true, suggestions: true, status: true },
      });

      if (!audit || audit.status !== 'COMPLETED' || !audit.report) {
        console.log(`[ai-suggestions-worker] Audit ${auditId} not ready, skipping`);
        return;
      }

      const report = audit.report as unknown as AuditReport;

      // Generate AI-powered suggestions
      const aiResponse = await generateAISuggestions(report);
      const aiSuggestions = aiSuggestionsToSuggestions(aiResponse);

      // Merge with existing rule-based suggestions (AI suggestions take priority)
      const existing = (audit.suggestions as unknown as Array<{ id: string }>) ?? [];
      const merged = [
        ...aiSuggestions,
        ...existing.filter((s) => !aiSuggestions.find((ai) => ai.relatedCheck === (s as { relatedCheck?: string }).relatedCheck)),
      ];

      await db.audit.update({
        where: { id: auditId },
        data: {
          suggestions: merged as unknown as Parameters<typeof db.audit.update>[0]['data']['suggestions'],
          aiSuggestionsStatus: 'done',
        },
      });

      console.log(`[ai-suggestions-worker] Generated ${aiSuggestions.length} AI suggestions for audit ${auditId}`);
    } catch (err) {
      console.error(`[ai-suggestions-worker] Failed for audit ${auditId}:`, err);

      await db.audit.update({
        where: { id: auditId },
        data: { aiSuggestionsStatus: 'pending' }, // reset so it can be retried
      });

      throw err;
    }
  },
  {
    connection: connection!,
    concurrency: 2,
  }
);

worker.on('completed', (job) => {
  console.log(`[ai-suggestions-worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[ai-suggestions-worker] Job ${job?.id} failed:`, err.message);
});

console.log('[ai-suggestions-worker] Worker started, listening for AI suggestion jobs...');
