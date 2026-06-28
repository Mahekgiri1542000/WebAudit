import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let attempts = 0;
      const maxAttempts = 60;

      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const poll = async () => {
        try {
          const audit = await db.audit.findUnique({
            where: { id },
            select: {
              status: true,
              overallScore: true,
              onPageScore: true,
              geoScore: true,
              aeoScore: true,
              pageSpeedScore: true,
              securityScore: true,
              aiSuggestionsStatus: true,
              errorMessage: true,
              completedAt: true,
            },
          });

          if (!audit) {
            send({ type: 'error', message: 'Audit not found' });
            controller.close();
            return;
          }

          send({ type: 'status', ...audit });

          if (audit.status === 'COMPLETED' || audit.status === 'FAILED') {
            send({ type: 'complete', status: audit.status });
            controller.close();
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            send({ type: 'timeout', message: 'Audit is taking longer than expected' });
            controller.close();
            return;
          }

          setTimeout(poll, 2000);
        } catch {
          controller.close();
        }
      };

      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
