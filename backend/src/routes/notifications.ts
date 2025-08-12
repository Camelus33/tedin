import express from 'express';
import { authenticate } from '../middlewares/auth';
import { Request, Response } from 'express';
import { sseHub } from '../services/SseHub';
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

// SSE stream endpoint (mounted by app.ts after default export)
export const notificationsStreamHandler = async (req: Request, res: Response) => {
  // This minimal SSE handler can be wired in app.ts as:
  // app.get('/api/notifications/stream', authenticate, notificationsStreamHandler)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // register client
  const userId = (req as any).user?._id || (req as any).user?.id;
  if (userId) {
    sseHub.register(String(userId), res);
  }

  const keepAlive = setInterval(() => {
    res.write(`event: keepalive\n`);
    res.write(`data: {"ts":"${new Date().toISOString()}"}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    if (userId) sseHub.unregister(String(userId), res);
  });
};