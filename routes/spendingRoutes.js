// routes/spendingRoutes.js
const express = require('express');
const { 
  addSpending, 
  getSpendingList, 
  getSpendingById,
  updateSpending,
  deleteSpending,
  getGenderStats,
  getAgeStats,
  getCategoryStats,
  getDashboardStats
} = require('../controllers/spendingController');

const router = express.Router();

// 소비 데이터 추가
router.post('/', addSpending);

// 소비 데이터 목록 조회
router.get('/', getSpendingList);

// 성별 통계
router.get('/stats/gender', getGenderStats);

// 연령별 통계
router.get('/stats/age', getAgeStats);

// 업종별 통계
router.get('/stats/category', getCategoryStats);

// 대시보드 통계
router.get('/dashboard', getDashboardStats);

// 특정 소비 데이터 조회
router.get('/:id', getSpendingById);

// 소비 데이터 수정
router.put('/:id', updateSpending);

// 소비 데이터 삭제
router.delete('/:id', deleteSpending);

module.exports = router;