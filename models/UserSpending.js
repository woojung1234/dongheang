// models/UserSpending.js
const mongoose = require('mongoose');

const UserSpendingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  total_spent: {
    type: Number,
    required: true
  },
  card_tpbuz_nm_1: {
    type: String,
    required: true
  },
  ta_ymd: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 업데이트 시 updatedAt 필드 자동 갱신
UserSpendingSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('UserSpending', UserSpendingSchema);