require('dotenv').config();
const passport = require('passport');
// const KakaoStrategy = require('passport-kakao').Strategy; // 카카오 로그인 비활성화
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

// 사용자 직렬화
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 사용자 역직렬화
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logToFile(`Passport 역직렬화 오류: ${error.message}`, 'ERROR');
    done(error, null);
  }
});

module.exports = passport;