// controllers/categoryMappingController.js
const fs = require('fs');
const path = require('path');
const CategoryMapping = require('../models/CategoryMapping');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 카테고리 매핑 추가
const addCategoryMapping = async (req, res) => {
  try {
    logToFile(`카테고리 매핑 추가 요청`);
    
    const { originalCategory, standardCategory, description } = req.body;
    
    // 필수 필드 확인
    if (!originalCategory || !standardCategory) {
      return res.status(400).json({ 
        success: false, 
        message: '원본 카테고리와 표준 카테고리는 필수 항목입니다.' 
      });
    }
    
    // 이미 존재하는 매핑인지 확인
    const existingMapping = await CategoryMapping.findOne({ originalCategory });
    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: '이미 해당 원본 카테고리에 대한 매핑이 존재합니다.'
      });
    }
    
    // 카테고리 매핑 추가
    const categoryMapping = await CategoryMapping.create({
      originalCategory,
      standardCategory,
      description
    });
    
    logToFile(`카테고리 매핑 추가 완료: ${originalCategory} -> ${standardCategory}`);
    
    res.status(201).json({
      success: true,
      data: categoryMapping,
      message: '카테고리 매핑이 추가되었습니다.'
    });
  } catch (error) {
    logToFile(`카테고리 매핑 추가 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 카테고리 매핑 목록 조회
const getCategoryMappings = async (req, res) => {
  try {
    logToFile(`카테고리 매핑 목록 조회 요청`);
    
    const categoryMappings = await CategoryMapping.find().sort({ standardCategory: 1, originalCategory: 1 });
    
    logToFile(`카테고리 매핑 목록 조회 완료: ${categoryMappings.length}건`);
    
    res.json({
      success: true,
      data: categoryMappings
    });
  } catch (error) {
    logToFile(`카테고리 매핑 목록 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 카테고리 매핑 조회
const getCategoryMappingById = async (req, res) => {
  try {
    logToFile(`특정 카테고리 매핑 조회 요청: ID ${req.params.id}`);
    
    const categoryMapping = await CategoryMapping.findById(req.params.id);
    
    if (!categoryMapping) {
      logToFile(`카테고리 매핑을 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '카테고리 매핑을 찾을 수 없습니다.' });
    }
    
    logToFile(`특정 카테고리 매핑 조회 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: categoryMapping
    });
  } catch (error) {
    logToFile(`특정 카테고리 매핑 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 카테고리 매핑 수정
const updateCategoryMapping = async (req, res) => {
  try {
    logToFile(`카테고리 매핑 수정 요청: ID ${req.params.id}`);
    
    const { standardCategory, description } = req.body;
    
    // 카테고리 매핑 확인
    let categoryMapping = await CategoryMapping.findById(req.params.id);
    
    if (!categoryMapping) {
      logToFile(`카테고리 매핑을 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '카테고리 매핑을 찾을 수 없습니다.' });
    }
    
    // 업데이트 데이터 구성
    const updateData = {};
    if (standardCategory !== undefined) updateData.standardCategory = standardCategory;
    if (description !== undefined) updateData.description = description;
    
    // originalCategory는 수정하지 않음 (고유 식별자 역할)
    
    // 카테고리 매핑 업데이트
    const updatedCategoryMapping = await CategoryMapping.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    logToFile(`카테고리 매핑 수정 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: updatedCategoryMapping,
      message: '카테고리 매핑이 수정되었습니다.'
    });
  } catch (error) {
    logToFile(`카테고리 매핑 수정 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 카테고리 매핑 삭제
const deleteCategoryMapping = async (req, res) => {
  try {
    logToFile(`카테고리 매핑 삭제 요청: ID ${req.params.id}`);
    
    // 카테고리 매핑 확인
    const categoryMapping = await CategoryMapping.findById(req.params.id);
    
    if (!categoryMapping) {
      logToFile(`카테고리 매핑을 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '카테고리 매핑을 찾을 수 없습니다.' });
    }
    
    // 카테고리 매핑 삭제
    await CategoryMapping.findByIdAndDelete(req.params.id);
    logToFile(`카테고리 매핑 삭제 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      message: '카테고리 매핑이 삭제되었습니다.'
    });
  } catch (error) {
    logToFile(`카테고리 매핑 삭제 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 원본 카테고리를 표준 카테고리로 변환
const mapCategory = async (req, res) => {
  try {
    logToFile(`카테고리 변환 요청`);
    
    const { originalCategory } = req.params;
    
    if (!originalCategory) {
      return res.status(400).json({
        success: false,
        message: '원본 카테고리는 필수 매개변수입니다.'
      });
    }
    
    // 매핑 조회
    const mapping = await CategoryMapping.findOne({ originalCategory });
    
    if (!mapping) {
      // 매핑이 없는 경우 기타로 처리
      logToFile(`매핑이 없는 카테고리: ${originalCategory} -> 기타로 처리`, 'WARNING');
      
      return res.json({
        success: true,
        data: {
          originalCategory,
          standardCategory: '기타',
          mapped: false
        }
      });
    }
    
    logToFile(`카테고리 변환 완료: ${originalCategory} -> ${mapping.standardCategory}`);
    
    res.json({
      success: true,
      data: {
        originalCategory,
        standardCategory: mapping.standardCategory,
        mapped: true
      }
    });
  } catch (error) {
    logToFile(`카테고리 변환 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 초기 카테고리 매핑 설정
const initializeCategoryMappings = async (req, res) => {
  try {
    logToFile(`초기 카테고리 매핑 설정 요청`);
    
    // 기존 매핑 개수 확인
    const existingCount = await CategoryMapping.countDocuments();
    
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: '이미 카테고리 매핑이 설정되어 있습니다. 초기화가 필요한 경우 기존 매핑을 먼저 삭제해주세요.'
      });
    }
    
    // 초기 매핑 데이터
    const initialMappings = [
      { originalCategory: '음식', standardCategory: '식비', description: '음식점, 카페, 식료품 등' },
      { originalCategory: '의료/건강', standardCategory: '의료', description: '병원, 약국, 건강관리 등' },
      { originalCategory: '공연/전시', standardCategory: '문화', description: '공연, 전시회, 영화 등' },
      { originalCategory: '소매/유통', standardCategory: '의류', description: '의류, 잡화, 일상용품 등' },
      { originalCategory: '생활서비스', standardCategory: '주거', description: '주거 관련 서비스, 생활 편의 등' },
      { originalCategory: '미디어/통신', standardCategory: '교통', description: '통신비, 교통비, 미디어 구독 등' },
      { originalCategory: '여가/오락', standardCategory: '문화', description: '취미, 여가 활동 등' },
      { originalCategory: '학문/교육', standardCategory: '기타', description: '교육비, 학원, 강의 등' },
      { originalCategory: '공공/기업/단체', standardCategory: '기타', description: '공공 서비스, 기업, 단체 관련 지출' }
    ];
    
    // 매핑 데이터 일괄 추가
    const result = await CategoryMapping.insertMany(initialMappings);
    
    logToFile(`초기 카테고리 매핑 설정 완료: ${result.length}건 추가됨`);
    
    res.status(201).json({
      success: true,
      message: `${result.length}개의 초기 카테고리 매핑이 설정되었습니다.`,
      data: result
    });
  } catch (error) {
    logToFile(`초기 카테고리 매핑 설정 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 카테고리 매핑 일괄 가져오기 (캐싱용)
const getAllMappings = async () => {
  try {
    const mappings = await CategoryMapping.find();
    const mappingObject = {};
    
    mappings.forEach(mapping => {
      mappingObject[mapping.originalCategory] = mapping.standardCategory;
    });
    
    return mappingObject;
  } catch (error) {
    logToFile(`카테고리 매핑 일괄 가져오기 오류: ${error.message}`, 'ERROR');
    return {
      '음식': '식비',
      '의료/건강': '의료',
      '공연/전시': '문화',
      '소매/유통': '의류',
      '생활서비스': '주거',
      '미디어/통신': '교통',
      '여가/오락': '문화',
      '학문/교육': '기타',
      '공공/기업/단체': '기타'
    };
  }
};

module.exports = {
  addCategoryMapping,
  getCategoryMappings,
  getCategoryMappingById,
  updateCategoryMapping,
  deleteCategoryMapping,
  mapCategory,
  initializeCategoryMappings,
  getAllMappings
};