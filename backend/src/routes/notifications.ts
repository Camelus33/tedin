import express from 'express';
import { authenticate } from '../middlewares/auth';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notificationController';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Fetch notifications, optional unreadOnly query
router.get('/', getNotifications);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/readAll', markAllRead);

export default router; 