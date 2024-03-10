export { };

const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
  text: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
  },
},
  {
    timestamps: true
  });

module.exports = mongoose.model('MessageModel', MessageSchema);
