require('dotenv').config();
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
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

// 카카오 전략 설정
const kakaoStrategyConfig = {
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_CALLBACK_URL
};

// 카카오 로그인 전략 구현
passport.use(new KakaoStrategy(kakaoStrategyConfig, async (accessToken, refreshToken, profile, done) => {
  try {
    logToFile(`카카오 로그인 시도: ${profile.id}`);
    
    // 프로필 정보 추출
    const kakaoId = profile.id;
    const email = profile._json?.kakao_account?.email || `${kakaoId}@kakao.user`;
    const name = profile.displayName || profile._json?.properties?.nickname || '사용자';
    const profileImage = profile._json?.properties?.profile_image || null;
    
    // 기존 사용자 확인
    let user = await User.findOne({ kakaoId });
    
    // 사용자가 없으면 새로 생성
    if (!user) {
      logToFile(`신규 사용자 등록: ${kakaoId}, ${email}`);
      
      user = new User({
        kakaoId,
        email,
        name,
        profileImage,
        loginMethod: 'kakao',
        lastLogin: new Date()
      });
      
      await user.save();
    } else {
      // 기존 사용자 정보 업데이트
      logToFile(`기존 사용자 로그인: ${kakaoId}, ${email}`);
      
      user.lastLogin = new Date();
      
      // 프로필 정보 업데이트 (변경된 경우)
      if (name && user.name !== name) user.name = name;
      if (profileImage && user.profileImage !== profileImage) user.profileImage = profileImage;
      
      await user.save();
    }
    
    // 사용자 정보 반환
    return done(null, user);
  } catch (error) {
    logToFile(`카카오 로그인 오류: ${error.message}`, 'ERROR');
    return done(error, null);
  }
}));

module.exports = passport;
