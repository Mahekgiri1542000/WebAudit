import { db } from '@/lib/db';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { sendAuditAlertEmail } from './send-email';

type AlertPayload = {
  userId: string;
  monitoredSiteId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  userEmail?: string;
  userEmailAlertsEnabled?: boolean;
  baseUrl?: string;
};

export async function createAlert(payload: AlertPayload): Promise<void> {
  const notification = await db.notification.create({
    data: {
      userId: payload.userId,
      monitoredSiteId: payload.monitoredSiteId,
      type: payload.type,
      channel: NotificationChannel.BOTH,
      title: payload.title,
      message: payload.message,
      metadata: payload.metadata ? (payload.metadata as Parameters<typeof db.notification.create>[0]['data']['metadata']) : undefined,
    },
  });

  // Send email alert if user has email alerts enabled
  if (payload.userEmailAlertsEnabled && payload.userEmail && payload.baseUrl) {
    const reportUrl = `${payload.baseUrl}/dashboard/notifications`;
    try {
      await sendAuditAlertEmail(
        payload.userEmail,
        payload.monitoredSiteId ? `Site Alert` : 'Platform Alert',
        payload.message,
        reportUrl
      );
      await db.notification.update({
        where: { id: notification.id },
        data: { emailSent: true },
      });
    } catch (err) {
      console.error('Failed to send alert email:', err);
    }
  }
}

export async function createSecurityAlert(userId: string, title: string, message: string): Promise<void> {
  await db.notification.create({
    data: {
      userId,
      type: NotificationType.SECURITY_ALERT,
      channel: NotificationChannel.BOTH,
      title,
      message,
    },
  });
}
