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

// controllers/authController.js
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // 디버깅 로그 추가
    console.log('회원가입 요청 데이터:', { email, name, passwordLength: password ? password.length : 0 });
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 비밀번호는 필수입니다.' 
      });
    }
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: '이미 등록된 이메일입니다.' 
      });
    }
    
    // 새 사용자 생성
    const user = await User.create({
      email,
      password,
      name: name || email.split('@')[0],
      profileImage: 'https://via.placeholder.com/150'
    });
    
    logToFile(`새 사용자 등록: ${user._id}, 이메일: ${email}`);
    
    // 비밀번호 제외한 사용자 정보 반환
    const userData = await User.findById(user._id).select('-password');
    
    // JWT 토큰 생성
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    // 더 자세한 오류 로깅
    console.error('회원가입 상세 오류:', error);
    logToFile(`회원가입 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 일반 로그인
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일과 비밀번호는 필수입니다.' 
      });
    }
    
    // 이메일로 사용자 찾기 (비밀번호 필드 포함)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '잘못된 이메일 또는 비밀번호입니다.' 
      });
    }
    
    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '잘못된 이메일 또는 비밀번호입니다.' 
      });
    }
    
    // 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();
    
    logToFile(`사용자 로그인: ${user._id}, 이메일: ${email}`);
    
    // JWT 토큰 생성
    const token = generateToken(user._id);
    
    // 비밀번호 제외한 사용자 정보 반환
    const userData = await User.findById(user._id).select('-password');
    
    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    logToFile(`로그인 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
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
  register,
  login,
  checkAuth,
  logout,
  devLogin
};