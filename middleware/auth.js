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

const protect = async (req, res, next) => {
  try {
    let token;
    
    // 토큰 확인
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Bearer 토큰에서 추출
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 쿠키에서 추출
      token = req.cookies.token;
    }
    
    // 토큰이 없는 경우
    if (!token) {
      logToFile('인증 토큰이 없음', 'ERROR');
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 조회
    const user = await User.findById(decoded.id).select('-__v');
    
    if (!user) {
      logToFile('유효한 토큰이지만 사용자를 찾을 수 없음', 'ERROR');
      return res.status(401).json({ success: false, message: '유효하지 않은 사용자입니다.' });
    }
    
    // 사용자 정보를 요청 객체에 추가
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logToFile('잘못된 토큰 형식', 'ERROR');
      return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      logToFile('만료된 토큰', 'ERROR');
      return res.status(401).json({ success: false, message: '토큰이 만료되었습니다. 다시 로그인해주세요.' });
    }
    
    logToFile(`인증 미들웨어 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 개발 환경에서만 사용할 임시 인증 미들웨어
const devAuth = (req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return protect(req, res, next);
  }
  
  // 개발 환경에서 테스트 사용자 정보 설정
  req.user = {
    id: '000000000000000000000000', // 24자 ObjectId
    name: '테스트 사용자',
    email: 'test@example.com'
  };
  
  next();
};

module.exports = { protect, devAuth };
