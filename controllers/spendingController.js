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
    
    const { sex, age, total_spent, card_tpbuz_nm_1, ta_ymd, description } = req.body;
    
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
        card_tpbuz_nm_1,
        ta_ymd,
        description
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
      card_tpbuz_nm_1,
      startDate,
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter = {};
    
    if (sex) filter.sex = sex;
    if (age) filter.age = parseInt(age);
    if (card_tpbuz_nm_1) filter.card_tpbuz_nm_1 = card_tpbuz_nm_1;
    
    // 금액 범위 필터
    if (minAmount || maxAmount) {
      filter.total_spent = {};
      if (minAmount) filter.total_spent.$gte = parseFloat(minAmount);
      if (maxAmount) filter.total_spent.$lte = parseFloat(maxAmount);
    }
    
    // 날짜 범위 필터
    if (startDate || endDate) {
      filter.ta_ymd = {};
      if (startDate) filter.ta_ymd.$gte = startDate.replace(/-/g, '');
      if (endDate) filter.ta_ymd.$lte = endDate.replace(/-/g, '');
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
    
    const { sex, age, total_spent, card_tpbuz_nm_1, ta_ymd, description } = req.body;
    
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
    if (ta_ymd !== undefined) updateData.ta_ymd = ta_ymd;
    if (description !== undefined) updateData.description = description;
    
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
    
    // 연령대 범위 설정 (50대~90대)
    const ageRanges = [
      { min: 5, max: 5, label: '50대' },
      { min: 6, max: 6, label: '60대' },
      { min: 7, max: 7, label: '70대' },
      { min: 8, max: 8, label: '80대' },
      { min: 9, max: 9, label: '90대' }
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
        ageRange: `${range.min*10}-${range.max*10+9}`,
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
          $group: {
            _id: '$age',
            totalSpent: { $sum: '$total_spent' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      categoryDetailStats.push({
        category: category.category,
        genderDistribution,
        ageDistribution: ageDistribution.map(age => ({
          ageGroup: `${age._id*10}대`,
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
    
    // 연령대별 분포 (5-9를 50대에서 90대로 표시)
    const ageDistribution = await Spending.aggregate([
      {
        $group: {
          _id: '$age',
          total: { $sum: '$total_spent' },
          count: { $sum: 1 },
          avg: { $avg: '$total_spent' }
        }
      },
      {
        $sort: { _id: 1 }
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
            ageGroup: '$age',
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
          ageGroup: `${item._id*10}대`,
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
          ageGroup: `${item._id.ageGroup*10}대`,
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

// 월별 소비 통계
const getMonthlyStats = async (req, res) => {
  try {
    logToFile(`월별 소비 통계 조회 요청`);
    
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ 
        success: false, 
        message: '연도와 월은 필수 매개변수입니다.' 
      });
    }
    
    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}${month.padStart(2, '0')}01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}${month.padStart(2, '0')}${lastDay}`;
    
    // 월 총 지출 통계
    const monthlyTotal = await Spending.aggregate([
      {
        $match: {
          ta_ymd: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSpending: { $sum: '$total_spent' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // 업종별 지출 통계
    const categorySummary = await Spending.aggregate([
      {
        $match: {
          ta_ymd: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$card_tpbuz_nm_1',
          total: { $sum: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    
    // 전체 지출 중 업종별 비율 계산
    const totalAmount = monthlyTotal.length > 0 ? monthlyTotal[0].totalSpending : 0;
    
    const categoriesWithPercentage = categorySummary.map(cat => ({
      category: cat._id,
      total: cat.total,
      count: cat.count,
      percentage: totalAmount > 0 ? Math.round((cat.total / totalAmount) * 100) : 0
    }));
    
    // 일별 지출 통계
    const dailySummary = await Spending.aggregate([
      {
        $match: {
          ta_ymd: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$ta_ymd',
          total: { $sum: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const formattedDailySummary = dailySummary.map(day => {
      const dateStr = day._id;
      const yearPart = dateStr.substring(0, 4);
      const monthPart = dateStr.substring(4, 6);
      const dayPart = dateStr.substring(6, 8);
      
      return {
        day: parseInt(dayPart),
        date: `${yearPart}-${monthPart}-${dayPart}`,
        total: day.total,
        count: day.count
      };
    });
    
    logToFile(`월별 소비 통계 조회 완료`);
    
    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        totalSpending: totalAmount,
        transactionCount: monthlyTotal.length > 0 ? monthlyTotal[0].count : 0,
        categorySummary: categoriesWithPercentage,
        dailySummary: formattedDailySummary
      }
    });
  } catch (error) {
    logToFile(`월별 소비 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 동년배 비교 데이터
const getPeerComparison = async (req, res) => {
  try {
    logToFile(`동년배 비교 데이터 조회 요청`);
    
    const { age, sex, year, month } = req.query;
    
    // 사용자의 연령과 성별이 필요합니다
    if (!age) {
      return res.status(400).json({ 
        success: false, 
        message: '연령은 필수 매개변수입니다.' 
      });
    }
    
    const userAge = parseInt(age); // 5는 50대, 6은 60대, ...
    
    // 해당 월의 시작일과 종료일 계산 (있을 경우)
    let dateFilter = {};
    if (year && month) {
      const startDate = `${year}${month.padStart(2, '0')}01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}${month.padStart(2, '0')}${lastDay}`;
      
      dateFilter = {
        ta_ymd: { $gte: startDate, $lte: endDate }
      };
    }
    
    // 사용자 자신의 지출 패턴
    let userFilter = {
      age: userAge
    };
    
    // 성별 필터 추가 (있을 경우)
    if (sex) {
      userFilter.sex = sex;
    }
    
    // 날짜 필터 추가 (있을 경우)
    if (Object.keys(dateFilter).length > 0) {
      userFilter = { ...userFilter, ...dateFilter };
    }
    
    // 사용자 연령대 사용자들의 평균 지출 및 카테고리별 지출 통계
    const userAgeGroupStats = await Spending.aggregate([
      {
        $match: userFilter
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
    
    // 사용자 연령대의 카테고리별 지출 통계
    const userAgeGroupCategoryStats = await Spending.aggregate([
      {
        $match: userFilter
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
        $limit: 5 // 상위 5개 카테고리
      }
    ]);
    
    // 다른 연령대 평균 지출 통계 (비교용)
    const otherAgeGroups = [5, 6, 7, 8, 9].filter(a => a !== userAge);
    
    const otherAgeGroupsStats = [];
    
    for (const otherAge of otherAgeGroups) {
      let otherFilter = {
        age: otherAge
      };
      
      // 성별 필터 추가 (동일하게 적용)
      if (sex) {
        otherFilter.sex = sex;
      }
      
      // 날짜 필터 추가 (있을 경우)
      if (Object.keys(dateFilter).length > 0) {
        otherFilter = { ...otherFilter, ...dateFilter };
      }
      
      const ageStats = await Spending.aggregate([
        {
          $match: otherFilter
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
      
      otherAgeGroupsStats.push({
        ageGroup: `${otherAge*10}대`,
        totalSpent: ageStats.length > 0 ? ageStats[0].totalSpent : 0,
        avgSpent: ageStats.length > 0 ? Math.round(ageStats[0].avgSpent) : 0,
        count: ageStats.length > 0 ? ageStats[0].count : 0
      });
    }
    
    // 동일 연령대 다른 성별 비교 (성별이 주어진 경우)
    let oppositeSexStats = null;
    
    if (sex) {
      const oppositeSex = sex === 'M' ? 'F' : 'M';
      let oppositeSexFilter = {
        age: userAge,
        sex: oppositeSex
      };
      
      // 날짜 필터 추가 (있을 경우)
      if (Object.keys(dateFilter).length > 0) {
        oppositeSexFilter = { ...oppositeSexFilter, ...dateFilter };
      }
      
      const oppositeSexAggregation = await Spending.aggregate([
        {
          $match: oppositeSexFilter
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
      
      // 동일 연령대 다른 성별의 카테고리별 통계
      const oppositeSexCategoryStats = await Spending.aggregate([
        {
          $match: oppositeSexFilter
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
          $limit: 5 // 상위 5개 카테고리
        }
      ]);
      
      oppositeSexStats = {
        sex: oppositeSex,
        stats: oppositeSexAggregation.length > 0 ? {
          totalSpent: oppositeSexAggregation[0].totalSpent,
          avgSpent: Math.round(oppositeSexAggregation[0].avgSpent),
          count: oppositeSexAggregation[0].count
        } : {
          totalSpent: 0,
          avgSpent: 0,
          count: 0
        },
        topCategories: oppositeSexCategoryStats.map(cat => ({
          category: cat._id,
          totalSpent: cat.totalSpent,
          avgSpent: Math.round(cat.avgSpent),
          count: cat.count
        }))
      };
    }
    
    // 모든 연령대와 성별 평균 (비교 기준점)
    const overallStats = await Spending.aggregate([
      {
        $match: Object.keys(dateFilter).length > 0 ? dateFilter : {}
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
    
    // 상위 지출 업종 카테고리별 평균 소비량 비교
    const topCategories = userAgeGroupCategoryStats.map(cat => cat._id);
    
    const categoriesComparison = [];
    
    for (const category of topCategories) {
      const categoryStats = await Spending.aggregate([
        {
          $match: {
            card_tpbuz_nm_1: category,
            ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
          }
        },
        {
          $group: {
            _id: '$age',
            totalSpent: { $sum: '$total_spent' },
            avgSpent: { $avg: '$total_spent' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      categoriesComparison.push({
        category,
        ageGroups: categoryStats.map(stat => ({
          ageGroup: `${stat._id*10}대`,
          totalSpent: stat.totalSpent,
          avgSpent: Math.round(stat.avgSpent),
          count: stat.count,
          isUserAge: stat._id === userAge
        }))
      });
    }
    
    // 해당 연령대와 전체 평균 소비 차이 계산
    const userStats = userAgeGroupStats.length > 0 ? {
      totalSpent: userAgeGroupStats[0].totalSpent,
      avgSpent: Math.round(userAgeGroupStats[0].avgSpent),
      count: userAgeGroupStats[0].count
    } : {
      totalSpent: 0,
      avgSpent: 0,
      count: 0
    };
    
    const overallAvg = overallStats.length > 0 ? Math.round(overallStats[0].avgSpent) : 0;
    const spendingDifference = userStats.avgSpent - overallAvg;
    const percentageDifference = overallAvg > 0 ? 
      Math.round((spendingDifference / overallAvg) * 100) : 0;
    
    logToFile(`동년배 비교 데이터 조회 완료`);
    
    res.json({
      success: true,
      data: {
        userAgeGroup: {
          ageGroup: `${userAge*10}대`,
          stats: userStats,
          topCategories: userAgeGroupCategoryStats.map(cat => ({
            category: cat._id,
            totalSpent: cat.totalSpent,
            avgSpent: Math.round(cat.avgSpent),
            count: cat.count
          }))
        },
        otherAgeGroups: otherAgeGroupsStats,
        oppositeSexComparison: oppositeSexStats,
        overallAverage: overallAvg,
        comparison: {
          difference: spendingDifference,
          percentageDifference,
          interpretation: percentageDifference > 0 ? 
            `${userAge*10}대는 전체 평균보다 ${percentageDifference}% 더 많이 소비합니다.` :
            `${userAge*10}대는 전체 평균보다 ${Math.abs(percentageDifference)}% 더 적게 소비합니다.`
        },
        categoriesComparison
      }
    });
  } catch (error) {
    logToFile(`동년배 비교 데이터 조회 오류: ${error.message}`, 'ERROR');
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
  getDashboardStats,
  getMonthlyStats,
  getPeerComparison
};