// models/CategoryMapping.js
const mongoose = require('mongoose');

const CategoryMappingSchema = new mongoose.Schema({
  originalCategory: {
    type: String,
    required: true,
    unique: true
  },
  standardCategory: {
    type: String,
    required: true,
    enum: ['식비', '교통', '주거', '의료', '문화', '의류', '기타']
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
CategoryMappingSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('CategoryMapping', CategoryMappingSchema);