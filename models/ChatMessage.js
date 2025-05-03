const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  emotion: {
    type: String,
    enum: ['neutral', 'happy', 'sad', 'confused', 'surprised'],
    default: 'neutral'
  },
  intentDetected: {
    type: String,
    required: false
  },
  metadata: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
