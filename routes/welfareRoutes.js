const express = require('express');
const { 
  getWelfareServices, 
  getWelfareServiceById, 
  searchWelfareServices,
  syncWelfareServices,
  getPeerStatistics
} = require('../controllers/welfareController');
const { protect, devAuth } = require('../middleware/auth');

const router = express.Router();

// 개발 환경에서 인증 미들웨어 적용 (실제 환경에서는 protect 사용)
router.use(devAuth);

// 복지 서비스 목록 조회
router.get('/', getWelfareServices);

// 복지 서비스 검색
router.get('/search', searchWelfareServices);

// 동년배 통계 데이터 조회
router.get('/peer-statistics', getPeerStatistics);

// 복지 서비스 상세 조회
router.get('/:id', getWelfareServiceById);

// 공공데이터 API 동기화 (관리자 전용)
router.post('/sync', syncWelfareServices);

module.exports = router;
