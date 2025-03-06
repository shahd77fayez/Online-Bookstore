import Notification from '../DB/models/notification.model.js';
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Use the filter query built by middleware
            const filterQuery = req.filterQuery || { recipient: req.user._id };

            const [notifications, total] = await Promise.all([
                Notification.find(filterQuery)
                    .sort({ createdAt: -1 })
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
            res.status(500).json({ message: 'Error fetching notifications', error: error.message });
        }
    },

    // Get unread count
    async getUnreadCount(req, res) {
        try {
            const count = await Notification.countDocuments({
                recipient: req.user._id,
                isRead: false
            });
            res.json({ unreadCount: count });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching unread count', error: error.message });
        }
    },

    // Mark notification as read
    async markAsRead(req, res) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: req.params.id, recipient: req.user._id },
                { isRead: true },
                { new: true }
            );
            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }
            res.json(notification);
        } catch (error) {
            res.status(500).json({ message: 'Error marking notification as read', error: error.message });
        }
    },

    // Mark all notifications as read
    async markAllAsRead(req, res) {
        try {
            await Notification.updateMany(
                { recipient: req.user._id, isRead: false },
                { isRead: true }
            );
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
        }
    },

    // Create a notification (internal use)
    async createNotification(recipientId, type, title, message, relatedItem = null, itemModel = null) {
        try {
            // Validate input
            const validationErrors = validateNotificationInput(type, title, message);
            if (validationErrors.length > 0) {
                throw new Error('Validation failed: ' + validationErrors.join(', '));
            }

            // Trim input
            title = title.trim();
            message = message.trim();

            // Create and save notification
            const notification = new Notification({
                recipient: recipientId,
                type,
                title,
                message,
                relatedItem,
                itemModel
            });

            await notification.save();
            
            // Return populated notification
            return await notification.populate('relatedItem', 'title name status');
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
                createdAt: { $lt: thirtyDaysAgo }
            });

            console.log(`Cleaned up ${result.deletedCount} old notifications`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            throw error;
        }
    }
};


