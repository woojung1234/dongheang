const express = require('express');
const { 
  addSpending, 
  getSpendingList, 
  getSpendingById,
  updateSpending,
  deleteSpending,
  getMonthlyStats,
  getComparisonStats,
  getPredictionAnalysis,
  getBudgetRecommendation
} = require('../controllers/spendingController');
const { protect, devAuth } = require('../middleware/auth');

const router = express.Router();

// 개발 환경에서 인증 미들웨어 적용 (실제 환경에서는 protect 사용)
router.use(devAuth);

// 소비 내역 추가
router.post('/', addSpending);

// 소비 내역 목록 조회
router.get('/', getSpendingList);

// 월별 소비 통계
router.get('/stats/monthly', getMonthlyStats);

// 동년배 비교 통계
router.get('/stats/comparison', getComparisonStats);

// 소비 예측 분석
router.get('/stats/prediction', getPredictionAnalysis);

// 추천 예산 계획
router.get('/budget/recommendation', getBudgetRecommendation);

// 특정 소비 내역 조회
router.get('/:id', getSpendingById);

// 소비 내역 수정
router.put('/:id', updateSpending);

// 소비 내역 삭제
router.delete('/:id', deleteSpending);

module.exports = router;
