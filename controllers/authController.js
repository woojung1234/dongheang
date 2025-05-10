// controllers/authController.js
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const mongoose = require('mongoose');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  // 로그 디렉토리 확인 및 생성
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  
  fs.appendFile(path.join(logDir, 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// JWT 토큰 생성
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET이 설정되지 않았습니다.');
    throw new Error('JWT 설정 오류');
  }
  
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// 회원가입
const register = async (req, res) => {
  console.log('회원가입 요청 시작');
  
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB 연결 상태 오류:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: '데이터베이스 연결 오류가 발생했습니다.'
      });
    }
    
    const { email, password, name } = req.body;
    
    // 디버깅 로그 추가
    console.log('회원가입 요청 데이터:', { 
      email, 
      name, 
      passwordLength: password ? password.length : 0 
    });
    
    // 필수 필드 검증
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일은 필수입니다.' 
      });
    }
    
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: '비밀번호는 필수입니다.' 
      });
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '유효한 이메일 주소를 입력해주세요.'
      });
    }
    
    try {
      // 이메일 중복 확인
      console.log('이메일 중복 확인 중...');
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: '이미 등록된 이메일입니다.' 
        });
      }
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      return res.status(500).json({
        success: false,
        message: '사용자 확인 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    try {
      // 사용자 객체 생성
      console.log('사용자 객체 생성 중...');
      const userData = {
        email,
        password,
        name: name || email.split('@')[0],
        profileImage: 'https://via.placeholder.com/150'
      };
      
      // 새 사용자 생성
      const user = new User(userData);
      
      // 사용자 저장
      console.log('사용자 저장 중...');
      await user.save();
      console.log('사용자 저장 완료:', user._id);
      
      logToFile(`새 사용자 등록: ${user._id}, 이메일: ${email}`);
      
      // 비밀번호 제외한 사용자 정보 반환
      const savedUserData = await User.findById(user._id).select('-password');
      
      // JWT 토큰 생성
      const token = generateToken(user._id);
      
      return res.status(201).json({
        success: true,
        token,
        user: savedUserData
      });
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      return res.status(500).json({
        success: false,
        message: '사용자 생성 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    // 더 자세한 오류 로깅
    console.error('회원가입 상세 오류:', error);
    logToFile(`회원가입 오류: ${error.message}`, 'ERROR');
    return res.status(500).json({ 
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
    console.error('로그인 상세 오류:', error);
    logToFile(`로그인 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 로그인 상태 확인
const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// 로그아웃
const logout = (req, res) => {
  if (req.user && req.user.id) {
    logToFile(`사용자 로그아웃: ${req.user.id}`);
  } else {
    logToFile('사용자 로그아웃 (비인증 상태)');
  }
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
    console.error('개발용 로그인 상세 오류:', error);
    logToFile(`개발용 로그인 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  checkAuth,
  logout,
  devLogin
};