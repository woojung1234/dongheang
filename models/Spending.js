// models/Spending.js
const mongoose = require('mongoose');

const SpendingSchema = new mongoose.Schema({
  sex: {
    type: String,
    required: true,
    enum: ['F', 'M'] // 성별은 'F' 또는 'M'으로 제한
  },
  age: {
    type: Number,
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
  // 검색 및 필터링을 위한 추가 필드
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
SpendingSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Spending', SpendingSchema);