import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import { FilterQuery } from 'mongoose';

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