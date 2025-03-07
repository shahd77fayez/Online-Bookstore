import Notification from '../DB/models/notification.model.js';
import logger from '../middlewares/logger.js';
// Validation helper
const validateNotificationInput = (type, title, message) => {
  const errors = [];
  if (!['order_status', 'review', 'system'].includes(type)) {
    errors.push('Invalid notification type');
  }
  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  if (!message || message.trim().length < 5) {
    errors.push('Message must be at least 5 characters long');
  }
  return errors;
};

export const notificationController = {
  // Get notifications for a user with pagination and filtering
  async getUserNotifications(req, res) {
    try {
      const page = Number.parseInt(req.query.page) || 1;
      const limit = Number.parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      logger.info(`Fetching notifications for user ${req.user._id}`);

      // Use the filter query built by middleware
      const filterQuery = req.filterQuery || {recipients: req.user._id};

      const [notifications, total] = await Promise.all([
        Notification.find(filterQuery)
          .sort({createdAt: -1})
          .skip(skip)
          .limit(limit)
          .populate('relatedItem', 'title name status'), // Populate relevant fields
        Notification.countDocuments(filterQuery)
      ]);

      res.json({
        notifications,
        filters: {
          type: req.query.type || 'all',
          isRead: req.query.isRead ? req.query.isRead === 'true' : 'all'
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: skip + limit < total,
          hasPrevPage: page > 1,
          limit
        }
      });
    } catch (error) {
      res.status(500).json({message: 'Error fetching notifications', error: error.message});
    }
  },

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const count = await Notification.countDocuments({
        recipients: req.user._id,
        isRead: false
      });
      logger.info(`Unread notifications count for user ${req.user._id}: ${count}`);
      res.json({unreadCount: count});
    } catch (error) {
      res.status(500).json({message: 'Error fetching unread count', error: error.message});
    }
  },

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      logger.info(`User ${req.user._id} marking notification ${req.params.id} as read`);
      const notification = await Notification.findOneAndUpdate(
        {_id: req.params.id, recipients: req.user._id},
        {isRead: true},
        {new: true}
      );
      if (!notification) {
        logger.warn(`Notification ${req.params.id} not found for user ${req.user._id}`);
        return res.status(404).json({message: 'Notification not found'});
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({message: 'Error marking notification as read', error: error.message});
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      logger.info(`User ${req.user._id} marking all notifications as read`);
      await Notification.updateMany(
        {recipients: req.user._id, isRead: false},
        {isRead: true}
      );
      res.json({message: 'All notifications marked as read'});
    } catch (error) {
      res.status(500).json({message: 'Error marking all notifications as read', error: error.message});
    }
  },

  // Create a notification for a single recipient (internal use)
  async createNotification(recipientId, type, title, message, relatedItem = null, itemModel = null) {
    try {
      // Validate input
      const validationErrors = validateNotificationInput(type, title, message);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Trim input
      title = title.trim();
      message = message.trim();

      // Create and save notification
      const notification = new Notification({
        recipients: [recipientId],
        type,
        title,
        message,
        relatedItem,
        itemModel
      });

      await notification.save();
      logger.info(`Notification created for user ${recipientId} - Type: ${type}, Title: ${title}`);
      // Return populated notification
      const populatedNotification = await Notification.findById(notification._id)
        .populate('relatedItem', 'title name status');

      return populatedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Create a notification for multiple recipients (internal use)
  async createMultiRecipientNotification(recipientIds, type, title, message, relatedItem = null, itemModel = null) {
    try {
      // Validate input
      const validationErrors = validateNotificationInput(type, title, message);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Trim input
      title = title.trim();
      message = message.trim();

      // Create and save notification
      const notification = new Notification({
        recipients: recipientIds,
        type,
        title,
        message,
        relatedItem,
        itemModel
      });

      await notification.save();
      logger.info(`Notification created for ${recipientIds.length} recipients - Type: ${type}, Title: ${title}`);

      // Return populated notification following the correct pattern
      const populatedNotification = await Notification.findById(notification._id)
        .populate('relatedItem', 'title name status');

      return populatedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Cleanup old notifications (internal use)
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete read notifications older than 30 days
      const result = await Notification.deleteMany({
        isRead: true,
        createdAt: {$lt: thirtyDaysAgo}
      });
      logger.info(`Cleaned up ${result.deletedCount} old notifications`);
      // console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
};
