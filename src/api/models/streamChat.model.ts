const mongoose = require('mongoose');

const StreamChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'stream'
    }
  },
  {
    timestamps: true
  }
);

const StreamChat = mongoose.model('StreamChat', StreamChatSchema);

module.exports = StreamChat;
