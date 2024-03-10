export {};
import { Request, Response, NextFunction } from 'express';
const httpStatus = require('http-status');
const Stream = require('../models/stream.model');
import { User } from '../../api/models';
const StreamChat = require('../models/streamChat.model');

export const createStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {  console, youTubeStream, description, game } = req.body;
    
    const userId = req.route.meta.user._id
    
    if (!youTubeStream || !userId || !description || !game) {
      const error = new Error('Missing Data');
      return next(error); // Return here to prevent further execution
    }

    const match = youTubeStream;  
    
    if (match) {
      const iframeHtml = youTubeStream;
      const user = await User.get(userId);
    
      if (user) {
        const newStream = new Stream({
          userId,
          console,
          iframeHtml,
          description,
          game
        });
        const savedStream = await newStream.save();
        return res.status(httpStatus.CREATED).json({ // Return here
          status: 'success',
          data: savedStream
        });
      } else {
        const error = new Error('User not found');
        return next(error); // Return here
      }
    } 
  } catch (error) {
    console.log(error);
    // Handle any errors
    return next(error); // Return here
  }
};

exports.deleteStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    // Check if the stream exists
    const stream = await Stream.findById(id);
    if (!stream) {
      const error = new Error('Stream not found');
      return next(error);
    }

    // Check if the authenticated user is the owner of the stream
    if (stream.userId.toString() !== userId) {
      const error = new Error('Unauthorized');
      return next(error);
    }

    // Delete the stream
    await stream.remove();

    res.status(httpStatus.OK).json({
      status: 'success',
      message: 'Stream deleted successfully'
    });
  } catch (error) {
    // Handle any errors
    next(error);
  }
};
exports.updateStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, youTubeStream, description, game } = req.body;
    const userId = req.body.userId;
    const updateFields: any = {};

    // Check if the stream exists
    const stream = await Stream.findById(id);
    if (!stream) {
      const error = new Error('Stream not found');
      return next(error);
    }

    // Check if the authenticated user is the owner of the stream
    if (stream.userId.toString() !== userId) {
      const error = new Error('Unauthorized');
      return next(error);
    }

    // Update the stream fields
    if (title) updateFields.title = title;
    if (youTubeStream) updateFields.youTubeStream = youTubeStream;
    if (description) updateFields.description = description;
    if (game) updateFields.game = game;

    // Update the stream with provided fields
    Object.assign(stream, updateFields);

    // Save the updated stream
    const updatedStream = await stream.save();

    res.status(httpStatus.OK).json({
      status: 'success',
      data: updatedStream
    });
  } catch (error) {
    // Handle any errors
    next(error);
  }
};

export const getAllStreams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, game, userId, title } = req.query;

    const query: any = {};
    if (game) query.game = game;
    if (userId) query.userId = userId;
    if (title) query.title = title;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };
    const streams = await Stream.paginate(query, options);
    res.json(streams);
  } catch (error) {
    next(error);
  }
};

export const getOneStreams = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const streams = await Stream.findById(req.params.id);
    res.json(streams);
  } catch (error) {
    next(error);
  }
};

exports.createChatMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderId, message, streamId } = req.body;

    if (!senderId || !message || !streamId) {
      const error = new Error('Missing required data');
      return next(error);
    }

    const stream = await Stream.findById(streamId);
    if (!stream) {
      const error = new Error('Stream not found');
      return next(error);
    }

    const newChatMessage = new StreamChat({
      sender: senderId,
      message,
      streamId
    });

    const savedChatMessage = await newChatMessage.save();
    console.log(savedChatMessage);

    stream.chat.push(savedChatMessage._id);
    await stream.save();

    res.status(201).json({
      message: 'Chat message created successfully',
      chatMessage: savedChatMessage
    });
  } catch (error) {
    next(error);
  }
};
exports.getChatMessagesByStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { streamId } = req.params;

    const chatMessages = await StreamChat.find({ streamId: streamId });
    console.log(chatMessages);

    res.json(chatMessages);
  } catch (error) {
    next(error);
  }
};
