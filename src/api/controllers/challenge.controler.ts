import { NextFunction, Request, Response } from 'express';
// const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const APIError = require('../../api/utils/APIError');
const Challenge = require('../models/challenge.model');
const Demande = require('../models/demande.model');
const uuidv4 = require('uuid/v4');


import { apiJson } from '../../api/utils/Utils';
import { Discussion } from '../models';

const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.query = { ...req.query };
    const data = (await Challenge.list(req)).transform(req);

    apiJson({ req, res, data, model: Challenge });
  } catch (e) {
    next(e);
  }
};

const createChallenge = (req: any, res: any, next: any) => {
  try {
    const { play, game, Level, averageBet, console } = req.body;
    if (!game || !console || !Level || !averageBet || !play) {
      throw new APIError({
        message: 'all fields are required',
        status: 302
      });
    }
    const creatorId = req.route.meta.user._id;

    const discussion = new Challenge({
      ...req.body,
      userToChallenge: creatorId
    });

    discussion.save((err: any) => {
      if (err) return next(err);
      res.json(discussion);
    });
  } catch (e) {
    next(e);
  }
};

const getOneChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    req.query = { ...req.query, _id: id };
    const challenge = await Challenge.list(req);

    apiJson({ req, res, data: challenge[0], model: Challenge });
  } catch (e) {
    next(e);
  }
};

const acceptChallenge = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const user = req.route.meta.user;
  try {
    const challenge = await Challenge.get(id);
    challenge.enabled = false;
    const creatorId = req.route.meta.user._id;
    const participants = Array.from(new Set([creatorId, challenge.challengeRequester]));
    

    const discussion = new Discussion({
      ispublic: false,
      Average_Bet: challenge.averageBet,
      Max_Players: 2,
      title: `challenge`,
      game: challenge.game,
      messages: [],
      participants,
      creator: creatorId,
      challenge: id,
      code:uuidv4().replace(/-/g, '').slice(0, 10)
    });
    await discussion.save();
    challenge.save((err: any) => {
      if (err) return next(err);
      res.json({challenge, discussion});
    });
  } catch (err) {
    next(err);
  }
};
const refuseChallenge = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const user = req.route.meta.user;
  try {
    const challenge = await Challenge.get(id);
    console.log('user', user);
    console.log('challenge', challenge);

    // Print the data types of user._id and challenge.userToChallenge
    console.log('typeof user._id', typeof user._id);
    console.log('typeof challenge.userToChallenge', typeof challenge.userToChallenge);

    if (!user._id.equals(challenge.userToChallenge)) {
      throw new Error('You are not the one who was challenged');
    }
    challenge.challengeRequester = null;
    challenge.save((err: any) => {
      if (err) return next(err);
      res.json(challenge);
    });
  } catch (err) {
    next(err);
  }
};

const joinChallenge = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const user = req.route.meta.user;
  try {
    const challenge = await Challenge.get(id);
    challenge.challengeRequester = user;

    challenge.save((err: any) => {
      if (err) return next(err);
      res.json(challenge);
    });
  } catch (err) {
    next(err);
  }
};

const deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const discussion = await Challenge.get(id);
    await Challenge.findOneAndRemove({ _id: id, userToChallenge: req.route.meta.user._id });
    const data = { status: 'OK' };
    apiJson({ req, res, data: data });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  createChallenge,
  joinChallenge,
  deleteChallenge,
  list,
  getOneChallenge,
  acceptChallenge,
  refuseChallenge
};
