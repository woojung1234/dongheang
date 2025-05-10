// server.js
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// 환경 변수 먼저 로드
dotenv.config();

// Swagger 문서 로드
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));
} catch (error) {
  console.error('Swagger 문서 로드 오류:', error);
}

// 미들웨어 가져오기
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { connectMongo, testMongoConnection, testMysqlConnection } = require('./config/db');

// 라우터 가져오기
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const welfareRoutes = require('./routes/welfareRoutes');
const spendingRoutes = require('./routes/spendingRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

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
if (process.env.JWT_SECRET) {
  app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
} else {
  console.warn('JWT_SECRET이 설정되지 않았습니다. 세션 및 인증 기능이 제한됩니다.');
}

// Swagger UI 설정
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "동행앱 API 문서"
  }));
}

// 환경 변수 체크
console.log('환경 변수 확인:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGO_URI 설정됨:', !!process.env.MONGO_URI);
console.log('- JWT_SECRET 설정됨:', !!process.env.JWT_SECRET);
console.log('- CLIENT_URL:', process.env.CLIENT_URL);

// 데이터베이스 연결 확인용 API 엔드포인트
app.get('/api/health', async (req, res) => {
  const mongoStatus = await testMongoConnection();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongo: {
      connected: mongoStatus,
      readyState: mongoose.connection.readyState
    },
    environment: process.env.NODE_ENV
  });
});

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

// 서버 시작 전 데이터베이스 연결
const startServer = async () => {
  let mongoConnected = false;
  
  // 개발 환경에서 직접 MongoDB 연결 (Docker 없이)
  if (process.env.NODE_ENV === 'development' && process.env.MONGO_URI && !process.env.MONGO_URI.includes('mongo-db')) {
    try {
      // MongoDB 연결 시도
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      mongoConnected = true;
      logToFile('로컬 MongoDB 연결 성공');
    } catch (error) {
      logToFile(`로컬 MongoDB 연결 실패: ${error.message}`, 'ERROR');
      logToFile('Docker 환경에서 실행하거나 MongoDB를 로컬에 설치하세요.', 'INFO');
    }
  } else if (process.env.MONGO_URI) {
    // Docker 환경에서 MongoDB 연결 시도
    mongoConnected = await connectMongo();
  } else {
    logToFile('MONGO_URI가 설정되지 않았습니다. MongoDB 연결을 건너뜁니다.', 'WARN');
  }
  
  // 서버 시작
  app.listen(PORT, () => {
    logToFile(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    
    if (swaggerDocument) {
      logToFile(`Swagger API 문서: http://localhost:${PORT}/api-docs`);
    }
    
    console.log(`Server running on port ${PORT}`);
    
    if (swaggerDocument) {
      console.log(`Swagger API 문서: http://localhost:${PORT}/api-docs`);
    }
    
    console.log(`MongoDB 연결 상태: ${mongoConnected ? '연결됨' : '연결 안됨'}`);
  });
};

// 서버 시작
startServer().catch(err => {
  console.error('서버 시작 오류:', err);
  process.exit(1);
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