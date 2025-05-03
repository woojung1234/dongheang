const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

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

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// 카카오 로그인 콜백 처리
const kakaoCallback = async (req, res) => {
  try {
    // 카카오 로그인 처리는 Passport-Kakao 미들웨어에서 이미 처리됨
    // req.user에는 카카오에서 받은 프로필 정보가 들어있음
    logToFile(`카카오 로그인 콜백: ${req.user.kakaoId}`);
    
    // 기존 사용자 조회 또는 새 사용자 생성
    let user = await User.findOne({ kakaoId: req.user.kakaoId });
    
    if (!user) {
      // 신규 사용자 생성
      user = await User.create({
        kakaoId: req.user.kakaoId,
        email: req.user.email,
        name: req.user.name,
        profileImage: req.user.profileImage
      });
      logToFile(`신규 사용자 생성: ${user._id}`);
    } else {
      // 기존 사용자 로그인 시간 업데이트
      user.lastLogin = new Date();
      await user.save();
      logToFile(`기존 사용자 로그인: ${user._id}`);
    }
    
    // JWT 토큰 생성
    const token = generateToken(user._id);
    
    // 클라이언트로 리다이렉트 (토큰 포함)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    logToFile(`카카오 로그인 처리 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '로그인 처리 중 오류가 발생했습니다.' });
  }
};

// 로그인 상태 확인
const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// 로그아웃
const logout = (req, res) => {
  logToFile(`사용자 로그아웃: ${req.user.id}`);
  res.json({ success: true, message: '로그아웃 되었습니다.' });
};

// 개발용 임시 로그인 (실제 배포 환경에서는 제거)
const devLogin = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ success: false, message: '해당 경로를 찾을 수 없습니다.' });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: '이메일이 필요합니다.' });
    }
    
    // 기존 사용자 조회 또는 새 사용자 생성
    let user = await User.findOne({ email });
    
    if (!user) {
      // 개발용 테스트 사용자 생성
      user = await User.create({
        kakaoId: `dev_${Date.now()}`,
        email,
        name: '테스트 사용자',
        profileImage: 'https://via.placeholder.com/150'
      });
      logToFile(`개발용 테스트 사용자 생성: ${user._id}`);
    }
    
    // JWT 토큰 생성
    const token = generateToken(user._id);
    
    res.json({ success: true, token, user });
  } catch (error) {
    logToFile(`개발용 로그인 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  kakaoCallback,
  checkAuth,
  logout,
  devLogin
};
