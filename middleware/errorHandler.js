const fs = require('fs');
const path = require('path');

// 로깅 함수
const logToFile = (message, level = 'ERROR') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  logToFile(`404 오류: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // 상태 코드 설정 (기본값은 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // 오류 로깅
  logToFile(`오류 발생: ${err.message} (${statusCode})`);
  if (err.stack) {
    logToFile(`스택 트레이스: ${err.stack}`);
  }
  
  // 개발 환경에서는 스택 트레이스 포함
  const errorResponse = {
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  };
  
  res.status(statusCode).json(errorResponse);
};

module.exports = { notFound, errorHandler };
