export {};
const mongoose = require('mongoose');
import { transformData, listData } from '../utils/ModelUtils';
const APIError = require('../../api/utils/APIError');
const httpStatus = require('http-status');

const discussion = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'challenge',
      required: true
    },
    game: {
      type: String,
      required: true
    },

    ispublic: {
      type: Boolean,
      default: 'false',
      required: true
    },
    Average_Bet: {
      type: Number,
      default: 0.0,
      required: true
    },
    Max_Players: {
      type: Number,
      default: 1,
      min: 1,
      required: true
    },
    code: {
      type: String,
      unique: true
    },
    tags: {
      type: [String]
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }
    ]
  },
  { timestamps: true }
);
const ALLOWED_FIELDS = [
  'id',
  'creator',
  'participants',
  'ispublic',
  'Average_Bet',
  'Max_Players',
  'title',
  'game',
  'tags',
  'messages',
  'createdAt',
  'challenge'
];

discussion.method({
  // query is optional, e.g. to transform data for response but only include certain "fields"
  transform({ query = {} }: { query?: any } = {}) {
    // transform every record (only respond allowed fields and "&fields=" in query)
    return transformData(this, query, ALLOWED_FIELDS);
  }
});

discussion.statics = {
  list({ query }: { query: any }) {
    return listData(this, query, ALLOWED_FIELDS);
  },
  async get(id: any) {
    try {
      let discussion;

      if (mongoose.Types.ObjectId.isValid(id)) {
        discussion = await this.findById(id).exec();
      }
      if (discussion) {
        return discussion;
      }

      throw new APIError({
        message: 'discussion does not exist',
        status: httpStatus.NOT_FOUND
      });
    } catch (error) {
      throw error;
    }
  }
};

const Model = mongoose.model('Discussion', discussion);
Model.ALLOWED_FIELDS = ALLOWED_FIELDS;

module.exports = Model;
