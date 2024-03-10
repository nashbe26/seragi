export {};

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

import { transformData, listData } from '../utils/ModelUtils';
const APIError = require('../../api/utils/APIError');
const httpStatus = require('http-status');
const StreamSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    iframeHtml: {
      type: String
    },
    description: {
      type: String
    },
    views: {
      type: Number,
      default: 0
    },
    game: {
      type: String
    },
    console: {
      type: String
    },
    chat: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StreamChat'
      }
    ]
  },

  {
    timestamps: true
  }
);
StreamSchema.plugin(mongoosePaginate);

const Model = mongoose.model('stream', StreamSchema);

module.exports = Model;
