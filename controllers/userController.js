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

// 사용자 정보 가져오기
const getUserProfile = async (req, res) => {
  try {
    logToFile(`사용자 프로필 요청: 사용자 ID ${req.user.id}`);
    
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      logToFile(`사용자를 찾을 수 없음: ${req.user.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    logToFile(`사용자 프로필 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 정보 업데이트
const updateUserProfile = async (req, res) => {
  try {
    logToFile(`사용자 프로필 업데이트 요청: 사용자 ID ${req.user.id}`);
    
    const { name, age, gender, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (preferences) updateData.preferences = preferences;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-__v');
    
    if (!user) {
      logToFile(`사용자를 찾을 수 없음: ${req.user.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    
    logToFile(`사용자 프로필 업데이트 성공: ${req.user.id}`);
    res.json({ success: true, data: user, message: '프로필이 업데이트되었습니다.' });
  } catch (error) {
    logToFile(`사용자 프로필 업데이트 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
