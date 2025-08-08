import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import { FilterQuery } from 'mongoose';
import Note from '../models/Note';
import Session from '../models/Session';
import User from '../models/User';
import SummaryNote from '../models/SummaryNote';

// GET /api/notifications?unreadOnly=true|false
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const skip = Math.max(parseInt((req.query.skip as string) || '0', 10), 0);
    const filter: FilterQuery<INotification> = { userId };
    if (unreadOnly) {
      Object.assign(filter, { isRead: false });
    }
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'nickname');
    res.status(200).json(notifications);
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (notif.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();
    res.status(200).json(notif);
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// PUT /api/notifications/readAll
export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (err: any) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
}; 

// POST /api/notifications/webpush/subscribe
export const subscribeWebPush = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { endpoint, keys, userAgent } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    // Try update existing by endpoint
    const updateExisting = await User.updateOne(
      { _id: userId, 'webPushSubscriptions.endpoint': endpoint },
      {
        $set: {
          'webPushSubscriptions.$.keys': { p256dh: keys.p256dh, auth: keys.auth },
          'webPushSubscriptions.$.userAgent': userAgent || '',
          'webPushSubscriptions.$.isActive': true,
        },
      }
    );

    if (updateExisting.matchedCount === 0) {
      // Push new subscription
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            webPushSubscriptions: {
              endpoint,
              keys: { p256dh: keys.p256dh, auth: keys.auth },
              userAgent: userAgent || '',
              isActive: true,
              createdAt: new Date(),
            },
          },
        }
      );
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('subscribeWebPush error', err);
    return res.status(500).json({ error: 'Failed to subscribe web push' });
  }
};

// DELETE /api/notifications/webpush/unsubscribe
export const unsubscribeWebPush = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });

    await User.updateOne(
      { _id: userId, 'webPushSubscriptions.endpoint': endpoint },
      { $set: { 'webPushSubscriptions.$.isActive': false } }
    );

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('unsubscribeWebPush error', err);
    return res.status(500).json({ error: 'Failed to unsubscribe web push' });
  }
};

// ADMIN JOB: Generate nudges and suggestions
export const runEngagementJobs = async (req: Request, res: Response) => {
  try {
    const secret = (req.query.secret as string) || '';
    if (!process.env.ADMIN_JOB_SECRET || secret !== process.env.ADMIN_JOB_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const users = await User.find({}).select('_id preferences nickname email').lean();
    let created = 0;

    for (const u of users) {
      const userId = u._id;

      // Helper: prevent duplicate same-day by type
      const ensureOncePerDay = async (type: INotification['type']) => {
        const exists = await Notification.findOne({ userId, type, createdAt: { $gte: startOfToday } }).lean();
        return !exists;
      };

      // 1) Daily memo nudge: no notes in last 24h
      const noteCount24h = await Note.countDocuments({ userId, createdAt: { $gte: dayAgo } });
      if (noteCount24h === 0 && (await ensureOncePerDay('nudge_memo'))) {
        await Notification.create({ userId, senderId: userId, gameId: userId, type: 'nudge_memo', message: '오늘의 생각을 한 줄 메모로 남겨보세요 ✍️' });
        created++;
      }

      // 2) TS reminder: preferences.notificationTime ±15분, today TS 0
      const nt = (u as any).preferences?.notificationTime as string | undefined;
      if (nt) {
        const [h, m] = nt.split(':').map(Number);
        const target = new Date(startOfToday.getTime());
        target.setHours(h || 0, m || 0, 0, 0);
        const diff = Math.abs(now.getTime() - target.getTime());
        const within15m = diff <= 15 * 60 * 1000;
        if (within15m) {
          const tsToday = await Session.countDocuments({ userId, mode: 'TS', status: 'completed', createdAt: { $gte: startOfToday } });
          if (tsToday === 0 && (await ensureOncePerDay('nudge_ts'))) {
            await Notification.create({ userId, senderId: userId, gameId: userId, type: 'nudge_ts', message: '하루 10분, TS로 집중을 끌어올려요 🔥' });
            created++;
          }
        }
      }

      // 3) Zengo reminder: today 0, and no plays in last 3 days
      const zengoToday = await Session.countDocuments({ userId, mode: 'ZENGO', status: 'completed', createdAt: { $gte: startOfToday } });
      const zengo3d = await Session.countDocuments({ userId, mode: 'ZENGO', status: 'completed', createdAt: { $gte: threeDaysAgo } });
      if (zengoToday === 0 && zengo3d === 0 && (await ensureOncePerDay('nudge_zengo'))) {
        await Notification.create({ userId, senderId: userId, gameId: userId, type: 'nudge_zengo', message: '15초 두뇌 워밍업! Zengo로 시작해요 🧠' });
        created++;
      }

      // 4) Suggest summary: last 7d memos >= 10, and no recent summary note
      const memos7d = await Note.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } });
      if (memos7d >= 10) {
        const recentSummary = await SummaryNote.findOne({ userId, createdAt: { $gte: sevenDaysAgo } }).select('_id').lean();
        if (!recentSummary && (await ensureOncePerDay('suggest_summary'))) {
          await Notification.create({ userId, senderId: userId, gameId: userId, type: 'suggest_summary', message: '메모가 충분해요. 단권화 노트를 만들어 볼까요? 📚' });
          created++;
        }
      }
    }

    res.status(200).json({ ok: true, created });
  } catch (err: any) {
    console.error('runEngagementJobs error', err);
    res.status(500).json({ error: 'Job failed' });
  }
};