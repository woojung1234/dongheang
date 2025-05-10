const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 사용자 프로필 조회
router.get('/profile', getUserProfile);

// 사용자 프로필 업데이트
router.put('/profile', updateUserProfile);

module.exports = router;
