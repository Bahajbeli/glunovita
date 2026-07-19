import * as notificationService from '../services/notification.service.js';

export const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(
      req.user._id,
      req.user.role,
      req.user.region
    );
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(
      req.user._id,
      req.user.role,
      req.user.region
    );
    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};
