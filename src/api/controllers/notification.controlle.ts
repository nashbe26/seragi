export {};
import { Request, Response, NextFunction } from 'express';
const httpStatus = require('http-status');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

exports.deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    // Check if the Notification exists
    const notification = await Notification.findById(id);
    if (!notification) {
      const error = new Error('notification not found');
      return next(error);
    }

    // Check if the authenticated user is the owner of the stream
    if (notification.user.toString() !== userId) {
      const error = new Error('Unauthorized');
      return next(error);
    }

    // Delete the stream
    await notification.remove();

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    // Handle any errors
    next(error);
  }
};
exports.readNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.route.meta.user._id
    const query: any = {};
  
    const userData = await User.findById(user);

    if (!user) {
      const error = new Error('Missing User ID');
      return next(error);
    }
    if (!user) {
      const error = new Error('user Not found');
      return next(error);
    }

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      populate:'id_owner'
    };
    const notifications = await Notification.paginate(query, options);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
