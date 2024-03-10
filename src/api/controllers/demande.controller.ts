import { NextFunction, Request, Response } from 'express';
// const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const APIError = require('../../api/utils/APIError');

const Demande = require('../models/demande.model');
const uuidv4 = require('uuid/v4');

import { apiJson } from '../../api/utils/Utils';


const list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.query = { ...req.query };
        const data = (await Demande.list(req)).transform(req);
      
        apiJson({ req, res, data, model: Demande });
    } catch (e) {
        next(e);
    }
};

const getOneDiscussion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        req.query = { ...req.query, _id:id};
        const discussion = await Demande.list(req);
       
        
        apiJson({ req, res, data: discussion[0], model: Demande });
    } catch (e) {
        next(e);
    }
}



const deleteDiscussion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const discussion = (await Demande.get(id));
        await Demande.findByIdAndRemove(id)
        const data = { status: 'OK' };
        apiJson({ req, res, data: data });
    } catch (e) {
        next(e);
    }
}



module.exports = {
    deleteDiscussion,
    list,
    getOneDiscussion,
    
};
