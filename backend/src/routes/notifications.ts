import express from 'express';
import { authenticate } from '../middlewares/auth';
import { getNotifications, markAsRead, markAllRead, subscribeWebPush, unsubscribeWebPush, deleteNotification, deleteAllRead } from '../controllers/notificationController';
import Notification from '../models/Notification';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Fetch notifications, optional unreadOnly query
router.get('/', getNotifications);

// Get notifications count (supports unreadOnly)
router.get('/count', async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const unreadOnly = req.query.unreadOnly === 'true';
    const filter: any = { userId };
    if (unreadOnly) filter.isRead = false;
    const count = await Notification.countDocuments(filter);
    res.status(200).json({ count });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to count notifications' });
  }
});

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/readAll', markAllRead);

// Delete all read notifications (place before '/:id' to avoid route shadowing)
router.delete('/read', deleteAllRead);

// Delete a single read notification
router.delete('/:id', deleteNotification);

// Web Push subscription management
router.post('/webpush/subscribe', subscribeWebPush);
router.delete('/webpush/unsubscribe', unsubscribeWebPush);

export default router; 