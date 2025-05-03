const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');

// 미들웨어 가져오기
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { connectMongo, testMysqlConnection } = require('./config/db');

// 라우터 가져오기
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const welfareRoutes = require('./routes/welfareRoutes');
const spendingRoutes = require('./routes/spendingRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// 환경 변수 로드
require('dotenv').config();

// 익스프레스 앱 초기화
const app = express();
const PORT = process.env.PORT || 5000;

// 로그 디렉토리 확인 및 생성
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  fs.appendFile(path.join(__dirname, 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger);

// 세션 및 Passport 설정
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/spending', spendingRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 정적 파일 제공 (프론트엔드 빌드)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// 에러 핸들러 미들웨어
app.use(notFound);
app.use(errorHandler);

// 개발 환경에서 직접 MongoDB 연결 (Docker 없이)
if (process.env.NODE_ENV === 'development' && !process.env.MONGO_URI.includes('mongo-db')) {
  try {
    // localhost MongoDB 연결 시도
    mongoose.connect('mongodb://localhost:27017/donghaeng')
      .then(() => {
        logToFile('로컬 MongoDB 연결 성공');
      })
      .catch((err) => {
        logToFile(`로컬 MongoDB 연결 실패: ${err.message}`, 'ERROR');
        logToFile('Docker 환경에서 실행하거나 MongoDB를 로컬에 설치하세요.', 'INFO');
      });
  } catch (error) {
    logToFile(`MongoDB 연결 오류: ${error.message}`, 'ERROR');
  }
} else {
  // Docker 환경에서 MongoDB 연결 시도
  connectMongo();
}

// 개발 환경에서 MySQL 연결 테스트 비활성화
if (process.env.NODE_ENV !== 'development') {
  testMysqlConnection();
}

// 서버 시작
app.listen(PORT, () => {
  logToFile(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`Server running on port ${PORT}`);
});

// 프로세스 종료 처리
process.on('unhandledRejection', (err) => {
  logToFile(`Unhandled Rejection: ${err.message}`, 'ERROR');
  console.log('UNHANDLED REJECTION! 서버를 종료합니다...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logToFile('SIGTERM 받음. 서버를 정상적으로 종료합니다.', 'INFO');
  process.exit(0);
});
