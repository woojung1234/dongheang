const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 사용자 프로필 조회
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logToFile(`사용자 프로필 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 사용자 프로필 업데이트
const updateProfile = async (req, res) => {
  try {
    // 업데이트할 필드 추출
    const { name, age, gender, region, interests } = req.body;
    
    // 업데이트할 데이터 객체 생성
    const updateData = {};
    
    // 옵셔널 필드 설정 (값이 있는 경우에만)
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (region !== undefined) updateData.region = region;
    if (interests !== undefined) updateData.interests = interests;
    
    // 사용자 정보 업데이트
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    logToFile(`사용자 프로필 업데이트: ${req.user.id}`);
    
    res.json({
      success: true,
      data: user,
      message: '프로필이 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    logToFile(`사용자 프로필 업데이트 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 사용자 계정 비활성화 (삭제는 아님)
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    logToFile(`사용자 계정 비활성화: ${req.user.id}`);
    
    res.json({
      success: true,
      message: '계정이 비활성화되었습니다.'
    });
  } catch (error) {
    logToFile(`사용자 계정 비활성화 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deactivateAccount
};