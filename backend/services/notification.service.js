import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const createNotification = async (creatorId, notificationData) => {
  const notification = new Notification({
    ...notificationData,
    createdBy: creatorId
  });

  await notification.save();

  await AuditLog.create({
    userId: creatorId,
    action: 'NOTIFICATION_CREATE',
    resourceType: 'NOTIFICATION',
    resourceId: notification._id,
    status: 'SUCCESS'
  });

  return notification;
};

export const getNotifications = async (userId, userRole, userRegion) => {
  const user = await User.findById(userId);
  
  const query = {
    $or: [
      { isBroadcast: true },
      { targetRoles: userRole },
      { targetRegions: userRegion },
      { targetUsers: userId }
    ]
  };

  // Add expiration filter
  query.$or.push({ expiresAt: { $gte: new Date() } });
  query.$or.push({ expiresAt: null });

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  // Mark as read (optional - you might want to do this separately)
  return notifications;
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    throw new Error('Notification not found');
  }

  const alreadyRead = notification.readBy.some(
    read => read.userId.toString() === userId.toString()
  );

  if (!alreadyRead) {
    notification.readBy.push({
      userId,
      readAt: new Date()
    });
    await notification.save();
  }

  return notification;
};

export const getUnreadCount = async (userId, userRole, userRegion) => {
  const user = await User.findById(userId);
  
  const query = {
    $or: [
      { isBroadcast: true },
      { targetRoles: userRole },
      { targetRegions: userRegion },
      { targetUsers: userId }
    ],
    readBy: { $not: { $elemMatch: { userId } } }
  };

  return await Notification.countDocuments(query);
};
