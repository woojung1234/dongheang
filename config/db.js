const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
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

// MongoDB 연결
const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logToFile(`MongoDB 연결 성공: ${conn.connection.host}`);
  } catch (error) {
    logToFile(`MongoDB 연결 실패: ${error.message}`, 'ERROR');
    process.exit(1);
  }
};

// MySQL 연결 풀 생성
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// MySQL 연결 테스트
const testMysqlConnection = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    logToFile('MySQL 연결 성공');
    connection.release();
  } catch (error) {
    logToFile(`MySQL 연결 실패: ${error.message}`, 'ERROR');
  }
};

module.exports = {
  connectMongo,
  mysqlPool,
  testMysqlConnection
};
