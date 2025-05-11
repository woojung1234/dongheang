// routes/userSpendingRoutes.js
const express = require('express');
const { 
  addUserSpending,
  getUserSpendingList,
  getUserSpendingById,
  updateUserSpending,
  deleteUserSpending,
  getUserSpendingAnalysis,
  getUserMonthlyStats,
  getUserDashboardStats,
  bulkAddUserSpendings,
  getCategorySpending  // 새로 추가
} = require('../controllers/userSpendingController');

const router = express.Router();

// 사용자 소비 데이터 추가
router.post('/', addUserSpending);

// 사용자 소비 데이터 일괄 추가
router.post('/bulk', bulkAddUserSpendings);

// 사용자 소비 데이터 목록 조회
router.get('/', getUserSpendingList);

// 사용자 소비 분석 (비교군과 비교)
router.get('/analysis', getUserSpendingAnalysis);

// 사용자 월별 소비 통계
router.get('/stats/monthly', getUserMonthlyStats);

// 사용자 대시보드 통계
router.get('/dashboard', getUserDashboardStats);

// 사용자 카테고리별 소비 (새로 추가)
router.get('/categories', getCategorySpending);

// 특정 사용자 소비 데이터 조회
router.get('/:id', getUserSpendingById);

// 사용자 소비 데이터 수정
router.put('/:id', updateUserSpending);

// 사용자 소비 데이터 삭제
router.delete('/:id', deleteUserSpending);

module.exports = router;