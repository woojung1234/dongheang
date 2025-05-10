const express = require('express');
const { register, login, checkAuth, logout, devLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', register);

// 일반 로그인
router.post('/login', login);

// 로그인 상태 확인
router.get('/check', protect, checkAuth);

// 로그아웃
router.post('/logout', protect, logout);

// 개발용 임시 로그인
router.post('/dev-login', devLogin);

module.exports = router;