const express = require('express');
const passport = require('passport');
const { kakaoCallback, checkAuth, logout, devLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 카카오 로그인 시작
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
router.get('/kakao/callback', 
  passport.authenticate('kakao', { session: false, failureRedirect: '/' }),
  kakaoCallback);

// 로그인 상태 확인
router.get('/check', protect, checkAuth);

// 로그아웃
router.post('/logout', protect, logout);

// 개발용 임시 로그인
router.post('/dev-login', devLogin);

module.exports = router;
