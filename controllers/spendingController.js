// controllers/spendingController.js
const fs = require('fs');
const path = require('path');
const Spending = require('../models/Spending');

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

// 소비 데이터 추가
const addSpending = async (req, res) => {
  try {
    logToFile(`소비 데이터 추가 요청`);
    
    const { sex, age, total_spent, card_tpbuz_nm_1 } = req.body;
    
    // 필수 필드 확인
    if (!sex || !age || !total_spent || !card_tpbuz_nm_1) {
      return res.status(400).json({ 
        success: false, 
        message: '성별, 나이, 총 지출, 카드 업종은 필수 항목입니다.' 
      });
    }
    
    // 소비 데이터 추가
    let spending;
    try {
      spending = await Spending.create({
        sex,
        age,
        total_spent,
        card_tpbuz_nm_1
      });
      
      logToFile(`소비 데이터 추가 완료: ID ${spending._id}`);
    } catch (dbError) {
      logToFile(`데이터베이스 저장 오류: ${dbError.message}`, 'ERROR');
      return res.status(500).json({ 
        success: false, 
        message: '데이터베이스 저장 중 오류가 발생했습니다.' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: spending,
      message: '소비 데이터가 추가되었습니다.'
    });
  } catch (error) {
    logToFile(`소비 데이터 추가 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 데이터 목록 조회
const getSpendingList = async (req, res) => {
  try {
    logToFile(`소비 데이터 목록 조회 요청`);
    
    const { 
      sex, 
      age, 
      minAmount, 
      maxAmount, 
      category,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter = {};
    
    if (sex) filter.sex = sex;
    if (age) filter.age = parseInt(age);
    if (category) filter.card_tpbuz_nm_1 = category;
    
    // 금액 범위 필터
    if (minAmount || maxAmount) {
      filter.total_spent = {};
      if (minAmount) filter.total_spent.$gte = parseFloat(minAmount);
      if (maxAmount) filter.total_spent.$lte = parseFloat(maxAmount);
    }
    
    // 소비 데이터 조회
    const spendings = await Spending.find(filter)
      .sort({ total_spent: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 전체 내역 수 조회
    const total = await Spending.countDocuments(filter);
    
    logToFile(`소비 데이터 목록 조회 완료: ${spendings.length}건 조회됨`);
    
    res.json({
      success: true,
      data: spendings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logToFile(`소비 데이터 목록 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 소비 데이터 조회
const getSpendingById = async (req, res) => {
  try {
    logToFile(`특정 소비 데이터 조회 요청: ID ${req.params.id}`);
    
    const spending = await Spending.findById(req.params.id);
    
    if (!spending) {
      logToFile(`소비 데이터를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 데이터를 찾을 수 없습니다.' });
    }
    
    logToFile(`특정 소비 데이터 조회 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: spending
    });
  } catch (error) {
    logToFile(`특정 소비 데이터 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 데이터 수정
const updateSpending = async (req, res) => {
  try {
    logToFile(`소비 데이터 수정 요청: ID ${req.params.id}`);
    
    const { sex, age, total_spent, card_tpbuz_nm_1 } = req.body;
    
    // 소비 데이터 확인
    let spending = await Spending.findById(req.params.id);
    
    if (!spending) {
      logToFile(`소비 데이터를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 데이터를 찾을 수 없습니다.' });
    }
    
    // 업데이트 데이터 구성
    const updateData = {};
    if (sex !== undefined) updateData.sex = sex;
    if (age !== undefined) updateData.age = parseInt(age);
    if (total_spent !== undefined) updateData.total_spent = parseFloat(total_spent);
    if (card_tpbuz_nm_1 !== undefined) updateData.card_tpbuz_nm_1 = card_tpbuz_nm_1;
    
    // 소비 데이터 업데이트
    const updatedSpending = await Spending.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    logToFile(`소비 데이터 수정 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: updatedSpending,
      message: '소비 데이터가 수정되었습니다.'
    });
  } catch (error) {
    logToFile(`소비 데이터 수정 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 데이터 삭제
const deleteSpending = async (req, res) => {
  try {
    logToFile(`소비 데이터 삭제 요청: ID ${req.params.id}`);
    
    // 소비 데이터 확인
    const spending = await Spending.findById(req.params.id);
    
    if (!spending) {
      logToFile(`소비 데이터를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 데이터를 찾을 수 없습니다.' });
    }
    
    // 소비 데이터 삭제
    await Spending.findByIdAndDelete(req.params.id);
    logToFile(`소비 데이터 삭제 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      message: '소비 데이터가 삭제되었습니다.'
    });
  } catch (error) {
    logToFile(`소비 데이터 삭제 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 성별 통계 조회
const getGenderStats = async (req, res) => {
  try {
    logToFile(`성별 통계 조회 요청`);
    
    // 성별로 그룹화하여 평균 지출 계산
    const genderStats = await Spending.aggregate([
      {
        $group: {
          _id: '$sex',
          avgSpending: { $avg: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { avgSpending: -1 }
      }
    ]);
    
    // 업종별 성별 지출 현황
    const categoryByGender = await Spending.aggregate([
      {
        $group: {
          _id: {
            category: '$card_tpbuz_nm_1',
            gender: '$sex'
          },
          totalSpent: { $sum: '$total_spent' },
          count: { $sum: 1 },
          avgSpent: { $avg: '$total_spent' }
        }
      },
      {
        $sort: { 'totalSpent': -1 }
      }
    ]);
    
    // 결과 포맷팅
    const formattedCategoryByGender = {};
    
    categoryByGender.forEach(item => {
      const category = item._id.category;
      const gender = item._id.gender;
      
      if (!formattedCategoryByGender[category]) {
        formattedCategoryByGender[category] = {
          categoryName: category,
          totalSpent: 0,
          F: { spent: 0, count: 0, avg: 0 },
          M: { spent: 0, count: 0, avg: 0 }
        };
      }
      
      formattedCategoryByGender[category][gender] = {
        spent: item.totalSpent,
        count: item.count,
        avg: Math.round(item.avgSpent)
      };
      
      formattedCategoryByGender[category].totalSpent += item.totalSpent;
    });
    
    // 총액 기준 내림차순 정렬
    const sortedCategories = Object.values(formattedCategoryByGender)
      .sort((a, b) => b.totalSpent - a.totalSpent);
    
    logToFile(`성별 통계 조회 완료`);
    
    res.json({
      success: true,
      data: {
        genderStats,
        categoryByGender: sortedCategories
      }
    });
  } catch (error) {
    logToFile(`성별 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 연령별 통계 조회
const getAgeStats = async (req, res) => {
  try {
    logToFile(`연령별 통계 조회 요청`);
    
    // 연령대 범위 설정
    const ageRanges = [
      { min: 0, max: 19, label: '10대 이하' },
      { min: 20, max: 29, label: '20대' },
      { min: 30, max: 39, label: '30대' },
      { min: 40, max: 49, label: '40대' },
      { min: 50, max: 59, label: '50대' },
      { min: 60, max: 69, label: '60대' },
      { min: 70, max: 150, label: '70대 이상' }
    ];
    
    // 연령대별 통계 결과 저장 배열
    const ageStats = [];
    
    // 각 연령대별 통계 계산
    for (const range of ageRanges) {
      const stats = await Spending.aggregate([
        {
          $match: {
            age: { $gte: range.min, $lte: range.max }
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$total_spent' },
            avgSpent: { $avg: '$total_spent' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      ageStats.push({
        ageGroup: range.label,
        ageRange: `${range.min}-${range.max}`,
        totalSpent: stats.length > 0 ? stats[0].totalSpent : 0,
        avgSpent: stats.length > 0 ? Math.round(stats[0].avgSpent) : 0,
        count: stats.length > 0 ? stats[0].count : 0
      });
    }
    
    // 연령대별 업종 사용 현황
    const ageGroupCategories = [];
    
    for (const range of ageRanges) {
      const categoryStats = await Spending.aggregate([
        {
          $match: {
            age: { $gte: range.min, $lte: range.max }
          }
        },
        {
          $group: {
            _id: '$card_tpbuz_nm_1',
            totalSpent: { $sum: '$total_spent' },
            avgSpent: { $avg: '$total_spent' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { totalSpent: -1 }
        },
        {
          $limit: 5 // 상위 5개 업종만 가져오기
        }
      ]);
      
      ageGroupCategories.push({
        ageGroup: range.label,
        topCategories: categoryStats.map(cat => ({
          category: cat._id,
          totalSpent: cat.totalSpent,
          avgSpent: Math.round(cat.avgSpent),
          count: cat.count
        }))
      });
    }
    
    logToFile(`연령별 통계 조회 완료`);
    
    res.json({
      success: true,
      data: {
        ageStats,
        ageGroupCategories
      }
    });
  } catch (error) {
    logToFile(`연령별 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 업종별 통계 조회
const getCategoryStats = async (req, res) => {
  try {
    logToFile(`업종별 통계 조회 요청`);
    
    // 업종별 총 지출 및 건수
    const categoryStats = await Spending.aggregate([
      {
        $group: {
          _id: '$card_tpbuz_nm_1',
          totalSpent: { $sum: '$total_spent' },
          avgSpent: { $avg: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);
    
    // 전체 지출 합계 계산
    const totalSum = categoryStats.reduce((sum, item) => sum + item.totalSpent, 0);
    
    // 비율 계산
    const formattedCategoryStats = categoryStats.map(item => ({
      category: item._id,
      totalSpent: item.totalSpent,
      avgSpent: Math.round(item.avgSpent),
      count: item.count,
      percentage: Math.round((item.totalSpent / totalSum) * 10000) / 100 // 소수점 2자리까지
    }));
    
    // 상위 업종과 성별/연령대별 사용 패턴
    const topCategories = formattedCategoryStats.slice(0, 10); // 상위 10개 업종
    
    const categoryDetailStats = [];
    
    for (const category of topCategories) {
      const genderDistribution = await Spending.aggregate([
        {
          $match: { card_tpbuz_nm_1: category.category }
        },
        {
          $group: {
            _id: '$sex',
            totalSpent: { $sum: '$total_spent' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      const ageDistribution = await Spending.aggregate([
        {
          $match: { card_tpbuz_nm_1: category.category }
        },
        {
          $bucket: {
            groupBy: '$age',
            boundaries: [0, 20, 30, 40, 50, 60, 70, 150],
            default: 'Other',
            output: {
              totalSpent: { $sum: '$total_spent' },
              count: { $sum: 1 }
            }
          }
        }
      ]);
      
      categoryDetailStats.push({
        category: category.category,
        genderDistribution,
        ageDistribution: ageDistribution.map(age => ({
          ageGroup: age._id === 0 ? '0-19' : 
                    age._id === 20 ? '20-29' : 
                    age._id === 30 ? '30-39' : 
                    age._id === 40 ? '40-49' : 
                    age._id === 50 ? '50-59' : 
                    age._id === 60 ? '60-69' : 
                    age._id === 70 ? '70+' : 'Other',
          totalSpent: age.totalSpent,
          count: age.count
        }))
      });
    }
    
    logToFile(`업종별 통계 조회 완료`);
    
    res.json({
      success: true,
      data: {
        allCategories: formattedCategoryStats,
        topCategories: topCategories.map(cat => cat.category),
        categoryDetailStats
      }
    });
  } catch (error) {
    logToFile(`업종별 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 분석 대시보드 데이터
const getDashboardStats = async (req, res) => {
  try {
    logToFile(`대시보드 통계 요청`);
    
    // 전체 소비 금액
    const totalSpending = await Spending.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total_spent' },
          count: { $sum: 1 },
          avg: { $avg: '$total_spent' }
        }
      }
    ]);
    
    // 성별 분포
    const genderDistribution = await Spending.aggregate([
      {
        $group: {
          _id: '$sex',
          total: { $sum: '$total_spent' },
          count: { $sum: 1 },
          avg: { $avg: '$total_spent' }
        }
      }
    ]);
    
    // 연령대별 분포
    const ageDistribution = await Spending.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 20, 30, 40, 50, 60, 70, 150],
          default: 'Other',
          output: {
            total: { $sum: '$total_spent' },
            count: { $sum: 1 },
            avg: { $avg: '$total_spent' }
          }
        }
      }
    ]);
    
    // 상위 5개 업종
    const topCategories = await Spending.aggregate([
      {
        $group: {
          _id: '$card_tpbuz_nm_1',
          total: { $sum: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // 연령대와 성별 조합별 지출
    const ageGenderCombinations = await Spending.aggregate([
      {
        $group: {
          _id: {
            ageGroup: {
              $switch: {
                branches: [
                  { case: { $lt: ['$age', 20] }, then: '10대 이하' },
                  { case: { $lt: ['$age', 30] }, then: '20대' },
                  { case: { $lt: ['$age', 40] }, then: '30대' },
                  { case: { $lt: ['$age', 50] }, then: '40대' },
                  { case: { $lt: ['$age', 60] }, then: '50대' },
                  { case: { $lt: ['$age', 70] }, then: '60대' }
                ],
                default: '70대 이상'
              }
            },
            gender: '$sex'
          },
          total: { $sum: '$total_spent' },
          count: { $sum: 1 },
          avg: { $avg: '$total_spent' }
        }
      },
      {
        $sort: { 'avg': -1 }
      }
    ]);
    
    logToFile(`대시보드 통계 조회 완료`);
    
    res.json({
      success: true,
      data: {
        totalSpending: totalSpending[0] || { total: 0, count: 0, avg: 0 },
        genderDistribution: genderDistribution.map(item => ({
          gender: item._id,
          totalSpent: item.total,
          count: item.count,
          avgSpent: Math.round(item.avg)
        })),
        ageDistribution: ageDistribution.map(item => ({
          ageGroup: item._id === 0 ? '0-19' : 
                    item._id === 20 ? '20-29' : 
                    item._id === 30 ? '30-39' : 
                    item._id === 40 ? '40-49' : 
                    item._id === 50 ? '50-59' : 
                    item._id === 60 ? '60-69' : 
                    item._id === 70 ? '70+' : 'Other',
          totalSpent: item.total,
          count: item.count,
          avgSpent: Math.round(item.avg)
        })),
        topCategories: topCategories.map(item => ({
          category: item._id,
          totalSpent: item.total,
          count: item.count
        })),
        ageGenderCombinations: ageGenderCombinations.map(item => ({
          ageGroup: item._id.ageGroup,
          gender: item._id.gender,
          totalSpent: item.total,
          count: item.count,
          avgSpent: Math.round(item.avg)
        }))
      }
    });
  } catch (error) {
    logToFile(`대시보드 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  addSpending,
  getSpendingList,
  getSpendingById,
  updateSpending,
  deleteSpending,
  getGenderStats,
  getAgeStats,
  getCategoryStats,
  getDashboardStats
};