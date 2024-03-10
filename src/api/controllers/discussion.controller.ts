import { NextFunction, Request, Response } from 'express';
// const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const APIError = require('../../api/utils/APIError');
const Discussion = require('../models/discussion.model');
const Demande = require('../models/demande.model');
const uuidv4 = require('uuid/v4');

import { apiJson } from '../../api/utils/Utils';


const list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.query = { ...req.query };
        const data = (await Discussion.list(req)).transform(req);
      
        apiJson({ req, res, data, model: Discussion });
    } catch (e) {
        next(e);
    }
};
// Function to get discussions that the user is already a member of
const getDiscussionsUserIsMemberOf = async (req: any, res: any, next: any) => {
    const userId = req.route.meta.user._id;
    try {
        const discussions = await Discussion.find({ participants: userId }).exec();
        res.json(discussions);
    } catch (err) {
        next(err);
    }
};

// Function to get discussions that the user is not a member of
const getDiscussionsUserIsNotMemberOf = async (req: any, res: any, next: any) => {
    const userId = req.route.meta.user._id;
    try {
        const discussions = await Discussion.find({ participants: { $ne: userId } }).exec();
        res.json(discussions);
    } catch (err) {
        next(err);
    }
};
const createDiscussion = (req: any, res: any, next: any) => {
    const { title, game ,Level,Average_Bet ,ispublic,Max_Players} = req.body;
    if (!game || !title || !Level || !ispublic || !Average_Bet || !Max_Players) {
        throw new APIError({
            message: 'all fields are required',
            status: 302
        });
    }
    const creatorId = req.route.meta.user._id;
    const participants = Array.from(new Set([creatorId]));


    const discussion = new Discussion({
        ...req.body, participants,creator:creatorId
    });


    discussion.save((err: any) => {
        if (err) return next(err);
        res.json(discussion);
    });
};
const getOneDiscussion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        req.query = { ...req.query, _id:id};
        const discussion = await Discussion.list(req);
       
        
        apiJson({ req, res, data: discussion[0], model: Discussion });
    } catch (e) {
        next(e);
    }
}

const joinDiscussion = async(req: any, res: any, next: any) => {
    const { id} = req.param;
    const user = req.route.meta.user;
    try {
        const discussion = await Discussion.get(id);
       if(discussion.participants.length  >= discussion.max_players){
           throw new Error('this discussion is full');
       }
       const userIndex = discussion.participants.indexOf(user._id);
       if (userIndex != -1) {
           throw new Error('User is already in the discussion');
       }
       discussion.participants = [...discussion.participants,user._id]
       discussion.save((err: any) => {
        if (err) return next(err);
        res.json(discussion);
    });
    }catch(err){
        next(err);
    }

};
const leaveDiscussion = async (req: any, res: any, next: any) => {
    const { id } = req.params;
    const user = req.route.meta.user;
    try {
        const discussion = await Discussion.get(id);
        
        // Check if the user is a participant in the discussion
        const userIndex = discussion.participants.indexOf(user._id);
        if (userIndex === -1) {
            throw new Error('User is not a participant in this discussion');
        }
        
        // Remove the user ID from the participants array
        discussion.participants.splice(userIndex, 1);
        
        // Save the updated discussion
        discussion.save((err: any) => {
            if (err) return next(err);
            res.json(discussion);
        });
    } catch (err) {
        next(err);
    }
};
const createCode = async(req: any, res: any, next: any) => {
    const { id} = req.param;
    const user = req.route.meta.user;
    try {
        const discussion = await Discussion.get(id);
        if(discussion.code !=null){
            res.json({ req, res, data: discussion.code });
        }
       discussion.code = uuidv4().replace(/-/g, '').slice(0, 10);
       
       discussion.save((err: any) => {
        if (err) return next(err);
        res.json({ req, res, data: discussion.code });
    });
    }catch(err){
        next(err);
    }

};
const deleteDiscussion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const discussion = (await Discussion.get(id));
        await Discussion.findByIdAndRemove(id)
        const data = { status: 'OK' };
        apiJson({ req, res, data: data });
    } catch (e) {
        next(e);
    }
}



module.exports = {
    createDiscussion,
    joinDiscussion,
    deleteDiscussion,
    list,
    getOneDiscussion,
    createCode,
    leaveDiscussion,
    getDiscussionsUserIsMemberOf,
    getDiscussionsUserIsNotMemberOf
    
};
