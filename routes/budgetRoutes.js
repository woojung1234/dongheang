// routes/budgetRoutes.js
const express = require('express');
const { 
  setBudget, 
  getCurrentBudget, 
  getBudgetByMonth,
  deleteBudget
} = require('../controllers/budgetController');

const router = express.Router();

// 예산 설정/업데이트
router.post('/', setBudget);

// 현재 월의 예산 조회
router.get('/current', getCurrentBudget);

// 특정 월의 예산 조회
router.get('/', getBudgetByMonth);

// 예산 삭제
router.delete('/', deleteBudget);

module.exports = router;