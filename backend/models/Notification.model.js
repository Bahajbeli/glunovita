import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['INFO', 'WARNING', 'ALERT', 'SURVEY', 'ANNOUNCEMENT'],
    default: 'INFO'
  },
  targetRoles: [{
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'AUTHORITY']
  }],
  targetRegions: [{
    type: String,
    trim: true
  }],
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isBroadcast: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  expiresAt: {
    type: Date
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  actionUrl: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ targetRoles: 1, createdAt: -1 });
notificationSchema.index({ targetRegions: 1, createdAt: -1 });
notificationSchema.index({ targetUsers: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
