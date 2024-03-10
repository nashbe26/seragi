import { NextFunction, Request, Response } from 'express';
// const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const APIError = require('../../api/utils/APIError');

const Wallet = require('../models/userWallet.model');
const uuidv4 = require('uuid/v4');

import { apiJson } from '../../api/utils/Utils';


const list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.query = { ...req.query };
        const data = (await Wallet.list(req)).transform(req);
      
        apiJson({ req, res, data, model: Wallet });
    } catch (e) {
        next(e);
    }
};

const getOneWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        req.query = { ...req.query, user:userId};
        const discussion = await Wallet.list(req);
       
        
        apiJson({ req, res, data: discussion[0], model: Wallet });
    } catch (e) {
        next(e);
    }
}
const setBetAverage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const{amount}=req.body
        
        const wallet = await Wallet.findOne({user:userId});
        wallet.averageBet =amount;
        await wallet.save()
       
        
        apiJson({ req, res, data: wallet, model: Wallet });
    } catch (e) {
        next(e);
    }
}



const deleteWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const discussion = (await Wallet.get(id));
        await Wallet.findByIdAndRemove(id)
        const data = { status: 'OK' };
        apiJson({ req, res, data: data });
    } catch (e) {
        next(e);
    }
}



module.exports = {
    deleteWallet,
    list,
    getOneWallet,
    setBetAverage
    
};
