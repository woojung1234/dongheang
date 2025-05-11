// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: false,
    select: false
  },
  name: {
    type: String,
    required: false
  },
  profileImage: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'unspecified'],
    default: 'unspecified'
  },
  region: {
    type: String,
    required: false
  },
  interests: {
    type: [String],
    default: []
  },
  preferences: {
    type: Object,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
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

// 비밀번호 해싱
UserSchema.pre('save', async function(next) {
  // 비밀번호가 없거나 수정되지 않은 경우 건너뛰기
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  
  try {
    console.log('비밀번호 해싱 시작...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('비밀번호 해싱 완료');
    next();
  } catch (error) {
    console.error('비밀번호 해싱 오류:', error);
    next(error);
  }
});

// 비밀번호 검증 메소드
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('비밀번호 검증 오류:', error);
    return false;
  }
};

// 업데이트 시 updatedAt 필드 자동 갱신
UserSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('User', UserSchema);