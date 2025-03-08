import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    enum: ['order_status', 'review', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemModel'
  },
  itemModel: {
    type: String,
    enum: ['Order', 'Books', 'Review', 'User']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries on recipients and isRead status
notificationSchema.index({recipients: 1, isRead: 1});
// Index for sorting by creation date
notificationSchema.index({createdAt: -1});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
