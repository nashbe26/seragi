export { };

const mongoose = require('mongoose');

import { transformData, listData } from '../utils/ModelUtils';
const APIError = require('../../api/utils/APIError');
const httpStatus = require('http-status');
const WalletSchema = new mongoose.Schema({
  

  description:{
    type: String,
    required: true,
    default:1.0

  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

},
  {
    timestamps: true
  });
  const ALLOWED_FIELDS = ['id','description', 'user', 'createdAt'];

  WalletSchema.statics = {
    list({ query }: { query: any }) {
      return listData(this, query, ALLOWED_FIELDS);
    },
    async get(id: any) {
      try {
        let wallet;
  
        if (mongoose.Types.ObjectId.isValid(id)) {
          wallet = await this.findById(id).exec();
        }
        if (wallet) {
          return wallet;
        }
  
        throw new APIError({
          message: 'discussion does not exist',
          status: httpStatus.NOT_FOUND
        });
      } catch (error) {
        throw error;
      }
    },
  };
const Model = mongoose.model('wallet', WalletSchema);
Model.ALLOWED_FIELDS = ALLOWED_FIELDS;

module.exports = Model;