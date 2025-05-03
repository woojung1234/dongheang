const mongoose = require('mongoose');

const WelfareServiceSchema = new mongoose.Schema({
  서비스아이디: {
    type: String,
    required: true,
    unique: true
  },
  서비스명: {
    type: String,
    required: true
  },
  서비스요약: {
    type: String,
    required: true
  },
  소관부처명: {
    type: String,
    required: false
  },
  소관조직명: {
    type: String,
    required: false
  },
  대표문의: {
    type: String,
    required: false
  },
  사이트: {
    type: String,
    required: false
  },
  서비스URL: {
    type: String,
    required: false
  },
  기준연도: {
    type: Number,
    required: false
  },
  최종수정일: {
    type: String,
    required: false
  },
  // 기존 필드들도 호환성을 위해 유지
  serviceId: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false,
    enum: ['문화', '교육', '의료', '생계', '주거', '고용', '기타']
  },
  targetAudience: {
    type: [String],
    required: false
  },
  eligibilityCriteria: {
    type: String,
    required: false
  },
  benefitDetails: {
    type: String,
    required: false
  },
  applicationMethod: {
    type: String,
    required: false
  },
  contactInformation: {
    type: String,
    required: false
  },
  provider: {
    type: String,
    required: false
  },
  region: {
    type: String,
    required: false
  },
  applicationDeadline: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
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
WelfareServiceSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('WelfareService', WelfareServiceSchema);
