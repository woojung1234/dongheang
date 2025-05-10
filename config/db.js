// config/db.js
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

// MongoDB 연결
const connectMongo = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGO_URI); // 확인용
    
    // 연결 옵션 추가
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logToFile(`MongoDB 연결 성공: ${conn.connection.host}`);
    
    // 연결 이벤트 처리
    mongoose.connection.on('error', (err) => {
      logToFile(`MongoDB 연결 오류: ${err.message}`, 'ERROR');
    });
    
    mongoose.connection.on('disconnected', () => {
      logToFile('MongoDB 연결이 끊어졌습니다.', 'WARN');
    });
    
    return true;
  } catch (error) {
    logToFile(`MongoDB 연결 실패: ${error.message}`, 'ERROR');
    console.error('MongoDB 연결 실패:', error);
    return false;
  }
};

// MongoDB 연결 테스트
const testMongoConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      logToFile('MongoDB 연결 상태: 연결됨');
      return true;
    } else {
      logToFile(`MongoDB 연결 상태: ${mongoose.connection.readyState}`, 'WARN');
      return await connectMongo();
    }
  } catch (error) {
    logToFile(`MongoDB 연결 테스트 실패: ${error.message}`, 'ERROR');
    return false;
  }
};

// MySQL 연결 풀 생성
const createMysqlPool = () => {
  try {
    if (!process.env.MYSQL_HOST) {
      logToFile('MySQL 환경 변수가 설정되지 않았습니다.', 'WARN');
      return null;
    }
    
    return mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } catch (error) {
    logToFile(`MySQL 풀 생성 실패: ${error.message}`, 'ERROR');
    return null;
  }
};

// MySQL 연결 테스트
const testMysqlConnection = async () => {
  try {
    const pool = createMysqlPool();
    if (!pool) {
      return false;
    }
    
    const connection = await pool.getConnection();
    logToFile('MySQL 연결 성공');
    connection.release();
    return true;
  } catch (error) {
    logToFile(`MySQL 연결 실패: ${error.message}`, 'ERROR');
    return false;
  }
};

module.exports = {
  connectMongo,
  testMongoConnection,
  createMysqlPool,
  testMysqlConnection
};