import {Router} from 'express';
import {notificationController} from '../controllers/notification.controller.js';
import {auth} from '../middlewares/auth.js';
import {asyncHandler} from '../middlewares/ErrorHandling.js';
import {validateQueryParams} from '../middlewares/notificationValidation.js';

const router = Router();

// Get all notifications for the authenticated user (with pagination and filtering)
router.get('/', auth(), validateQueryParams, asyncHandler(notificationController.getUserNotifications));

// Get unread notifications count
router.get('/unread-count', auth(), asyncHandler(notificationController.getUnreadCount));

// Mark a specific notification as read
router.patch('/:id/mark-read', auth(), asyncHandler(notificationController.markAsRead));

// Mark all notifications as read
router.patch('/mark-all-read', auth(), asyncHandler(notificationController.markAllAsRead));

export default router;
