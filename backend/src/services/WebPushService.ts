import webPush from 'web-push';
import User from '../models/User';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@habitus33.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export class WebPushService {
  static async sendToUser(userId: string, payload: WebPushPayload): Promise<{ sent: number; cleaned: number }> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return { sent: 0, cleaned: 0 };
    }

    const user = await User.findById(userId).select('webPushSubscriptions').lean();
    if (!user || !Array.isArray((user as any).webPushSubscriptions)) return { sent: 0, cleaned: 0 };

    const subs = (user as any).webPushSubscriptions.filter((s: any) => s.isActive);
    let sent = 0;
    let cleaned = 0;

    await Promise.all(
      subs.map(async (sub: any) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            JSON.stringify(payload)
          );
          sent += 1;
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await User.updateOne(
              { _id: userId, 'webPushSubscriptions.endpoint': sub.endpoint },
              { $set: { 'webPushSubscriptions.$.isActive': false } }
            );
            cleaned += 1;
          }
        }
      })
    );

    return { sent, cleaned };
  }
}


