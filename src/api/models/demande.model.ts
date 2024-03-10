export { };
const mongoose = require('mongoose');
import { transformData, listData } from '../../api/utils/ModelUtils';
const statu = ['acepted', 'attente', 'refuse'];
const DemandeSchema = new mongoose.Schema(
  {
    statut: {
      type: String,
      enum: statu,
      default: 'attente'
    },
  
    User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
    
  },
  { timestamps: true }
);
const ALLOWED_FIELDS = ['id', 'statut', 'User', 'discussion', 'createdAt'];

DemandeSchema.method({
  // query is optional, e.g. to transform data for response but only include certain "fields"
  transform({ query = {} }: { query?: any } = {}) {
    // transform every record (only respond allowed fields and "&fields=" in query)
    return transformData(this, query, ALLOWED_FIELDS);
  }
});

DemandeSchema.statics = {
  list({ query }: { query: any }) {
    return listData(this, query, ALLOWED_FIELDS);
  }
};

const Demande = mongoose.model('demande', DemandeSchema);
Demande.ALLOWED_FIELDS = ALLOWED_FIELDS;

module.exports = Demande;
