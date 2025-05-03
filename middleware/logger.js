const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
  // 원래 응답 메서드를 저장
  const originalSend = res.send;
  const originalJson = res.json;
  
  // 시작 시간 기록
  const startTime = Date.now();
  
  // 로그 메시지 생성
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '-';
  
  // 기본 로그 메시지 구성
  let logMessage = `[${timestamp}] ${method} ${url} ${ip} "${userAgent}"`;
  
  // 응답 메서드 오버라이드
  res.send = function (body) {
    // 응답 시간 계산
    const responseTime = Date.now() - startTime;
    
    // 완성된 로그 메시지
    const fullLogMessage = `${logMessage} ${res.statusCode} ${responseTime}ms\n`;
    
    // 로그 파일에 기록
    fs.appendFile(
      path.join(__dirname, '..', 'logs', 'app.log'),
      fullLogMessage,
      (err) => {
        if (err) {
          console.error('로그 작성 중 오류 발생:', err);
        }
      }
    );
    
    // 콘솔에도 출력
    console.log(fullLogMessage);
    
    // 원래 메서드 호출
    return originalSend.call(this, body);
  };
  
  res.json = function (body) {
    // 응답 시간 계산
    const responseTime = Date.now() - startTime;
    
    // 완성된 로그 메시지
    const fullLogMessage = `${logMessage} ${res.statusCode} ${responseTime}ms\n`;
    
    // 로그 파일에 기록
    fs.appendFile(
      path.join(__dirname, '..', 'logs', 'app.log'),
      fullLogMessage,
      (err) => {
        if (err) {
          console.error('로그 작성 중 오류 발생:', err);
        }
      }
    );
    
    // 콘솔에도 출력
    console.log(fullLogMessage);
    
    // 원래 메서드 호출
    return originalJson.call(this, body);
  };
  
  next();
};

module.exports = logger;
