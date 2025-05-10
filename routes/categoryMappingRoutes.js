// routes/categoryMappingRoutes.js
const express = require('express');
const { 
  addCategoryMapping,
  getCategoryMappings,
  getCategoryMappingById,
  updateCategoryMapping,
  deleteCategoryMapping,
  mapCategory,
  initializeCategoryMappings
} = require('../controllers/categoryMappingController');

const router = express.Router();

// 카테고리 매핑 추가
router.post('/', addCategoryMapping);

// 초기 카테고리 매핑 설정
router.post('/initialize', initializeCategoryMappings);

// 카테고리 매핑 목록 조회
router.get('/', getCategoryMappings);

// 원본 카테고리를 표준 카테고리로 변환
router.get('/map/:originalCategory', mapCategory);

// 특정 카테고리 매핑 조회
router.get('/:id', getCategoryMappingById);

// 카테고리 매핑 수정
router.put('/:id', updateCategoryMapping);

// 카테고리 매핑 삭제
router.delete('/:id', deleteCategoryMapping);

module.exports = router;