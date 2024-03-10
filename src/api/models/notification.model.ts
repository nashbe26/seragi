export {};

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationModel = new mongoose.Schema(
  {
    text: String,
    id_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    id_receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    seen: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['challenge', 'message', 'follow', 'challengeOne'],
      default: 'message'
    }
  },
  {
    timestamps: true
  }
);
notificationModel.plugin(mongoosePaginate);

module.exports = mongoose.model('notification', notificationModel);
