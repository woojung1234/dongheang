const express = require('express');
const { 
  sendMessage, 
  getChatHistory,
  getChatSessions
} = require('../controllers/chatbotController');
const { protect, devAuth } = require('../middleware/auth');

const router = express.Router();

// 개발 환경에서 인증 미들웨어 적용 (실제 환경에서는 protect 사용)
router.use(devAuth);

// 챗봇 메시지 전송
router.post('/message', sendMessage);

// 대화 내역 조회
router.get('/history', getChatHistory);

// 대화 세션 목록 조회
router.get('/sessions', getChatSessions);

module.exports = router;
