// controllers/userSpendingController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose'); // mongoose 추가
const UserSpending = require('../models/UserSpending');
const User = require('../models/User');
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

// 사용자 소비 데이터 추가
const addUserSpending = async (req, res) => {
  try {
    logToFile(`사용자 소비 데이터 추가 요청: 사용자 ID ${req.body.userId}`);
    
    const { userId, total_spent, card_tpbuz_nm_1, ta_ymd, description } = req.body;
    
    // 필수 필드 확인
    if (!userId || !total_spent || !card_tpbuz_nm_1 || !ta_ymd) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 ID, 총 지출, 카드 업종, 거래 일자는 필수 항목입니다.' 
      });
    }
    
    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      logToFile(`사용자를 찾을 수 없음: ID ${userId}`, 'ERROR');
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 소비 데이터 추가
    let userSpending;
    try {
      userSpending = await UserSpending.create({
        userId,
        total_spent,
        card_tpbuz_nm_1,
        ta_ymd,
        description
      });
      
      logToFile(`사용자 소비 데이터 추가 완료: ID ${userSpending._id}`);
    } catch (dbError) {
      logToFile(`데이터베이스 저장 오류: ${dbError.message}`, 'ERROR');
      return res.status(500).json({ 
        success: false, 
        message: '데이터베이스 저장 중 오류가 발생했습니다.' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: userSpending,
      message: '사용자 소비 데이터가 추가되었습니다.'
    });
  } catch (error) {
    logToFile(`사용자 소비 데이터 추가 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 소비 데이터 목록 조회
const getUserSpendingList = async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    logToFile(`사용자 소비 데이터 목록 조회 요청: 사용자 ID ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID는 필수 매개변수입니다.'
      });
    }
    
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter = { userId };
    
    // 날짜 범위 필터
    if (startDate || endDate) {
      filter.ta_ymd = {};
      if (startDate) filter.ta_ymd.$gte = startDate.replace(/-/g, '');
      if (endDate) filter.ta_ymd.$lte = endDate.replace(/-/g, '');
    }
    
    // 사용자 소비 데이터 조회
    const userSpendings = await UserSpending.find(filter)
      .sort({ ta_ymd: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 전체 내역 수 조회
    const total = await UserSpending.countDocuments(filter);
    
    logToFile(`사용자 소비 데이터 목록 조회 완료: ${userSpendings.length}건 조회됨`);
    
    res.json({
      success: true,
      data: userSpendings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logToFile(`사용자 소비 데이터 목록 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 사용자 소비 데이터 조회
const getUserSpendingById = async (req, res) => {
  try {
    logToFile(`특정 사용자 소비 데이터 조회 요청: ID ${req.params.id}`);
    
    const userSpending = await UserSpending.findById(req.params.id);
    
    if (!userSpending) {
      logToFile(`사용자 소비 데이터를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '사용자 소비 데이터를 찾을 수 없습니다.' });
    }
    
    logToFile(`특정 사용자 소비 데이터 조회 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: userSpending
    });
  } catch (error) {
    logToFile(`특정 사용자 소비 데이터 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 소비 데이터 수정
const updateUserSpending = async (req, res) => {
  try {
    logToFile(`사용자 소비 데이터 수정 요청: ID ${req.params.id}`);
    
    const { total_spent, card_tpbuz_nm_1, ta_ymd, description } = req.body;
    
    // 소비 데이터 확인
    let userSpending = await UserSpending.findById(req.params.id);
    
    if (!userSpending) {
      logToFile(`사용자 소비 데이터를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '사용자 소비 데이터를 찾을 수 없습니다.' });
    }
    
    // 업데이트 데이터 구성
    const updateData = {};
    if (total_spent !== undefined) updateData.total_spent = parseFloat(total_spent);
    if (card_tpbuz_nm_1 !== undefined) updateData.card_tpbuz_nm_1 = card_tpbuz_nm_1;
    if (ta_ymd !== undefined) updateData.ta_ymd = ta_ymd;
    if (description !== undefined) updateData.description = description;
    
    // 소비 데이터 업데이트
    const updatedUserSpending = await UserSpending.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    logToFile(`사용자 소비 데이터 수정 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: updatedUserSpending,
      message: '사용자 소비 데이터가 수정되었습니다.'
    });
  } catch (error) {
    logToFile(`사용자 소비 데이터 수정 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 소비 데이터 삭제
const deleteUserSpending = async (req, res) => {
  try {
    logToFile(`사용자 소비 데이터 삭제 요청: ID ${req.params.id}`);
    
    // 소비 데이터 확인
    const userSpending = await UserSpending.findById(req.params.id);
    
    if (!userSpending) {
      logToFile(`사용자 소비 데이터를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '사용자 소비 데이터를 찾을 수 없습니다.' });
    }
    
    // 소비 데이터 삭제
    await UserSpending.findByIdAndDelete(req.params.id);
    logToFile(`사용자 소비 데이터 삭제 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      message: '사용자 소비 데이터가 삭제되었습니다.'
    });
  } catch (error) {
    logToFile(`사용자 소비 데이터 삭제 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 소비 분석 (비교군과 비교)
const getUserSpendingAnalysis = async (req, res) => {
  try {
    const { userId, year, month } = req.query;
    
    logToFile(`사용자 소비 분석 요청: 사용자 ID ${userId}, 년도 ${year}, 월 ${month}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID는 필수 매개변수입니다.'
      });
    }
    
    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      logToFile(`사용자를 찾을 수 없음: ID ${userId}`, 'ERROR');
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 사용자의 연령대 확인
    const userAge = Math.floor(user.age / 10);
    const userGender = user.gender === 'male' ? 'M' : 'F';
    
    // 해당 월의 시작일과 종료일 계산
    let startDate, endDate;
    if (year && month) {
      const monthStr = month.toString().padStart(2, '0');
      startDate = `${year}${monthStr}01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      endDate = `${year}${monthStr}${lastDay}`;
    }
    
    // 필터 조건 구성
    const userFilter = { userId };
    if (startDate && endDate) {
      userFilter.ta_ymd = { $gte: startDate, $lte: endDate };
    }
    
    // 사용자 소비 데이터 집계
    const userSpendingByCategory = await UserSpending.aggregate([
      { $match: userFilter },
      { 
        $group: {
          _id: '$card_tpbuz_nm_1',
          totalSpent: { $sum: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);
    
    // 카테고리 매핑 추가 (spendingController의 getPeerComparison 함수에서 가져옴)
    const categoryMapping = {
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
    
    // 사용자 데이터 표준 카테고리로 매핑
    let userCategoryData = {
      '식비': { totalAmount: 0, count: 0 },
      '교통': { totalAmount: 0, count: 0 },
      '주거': { totalAmount: 0, count: 0 },
      '의료': { totalAmount: 0, count: 0 },
      '문화': { totalAmount: 0, count: 0 },
      '의류': { totalAmount: 0, count: 0 },
      '기타': { totalAmount: 0, count: 0 }
    };
    
    userSpendingByCategory.forEach(item => {
      const originalCategory = item._id || '';
      const category = categoryMapping[originalCategory] || '기타';
      
      userCategoryData[category].totalAmount += item.totalSpent;
      userCategoryData[category].count += item.count;
    });
    
    // 비교군 데이터 필터
    const peerFilter = { 
      age: userAge,
      sex: userGender
    };
    
    // 비교군 소비 데이터 집계
    const peerData = await Spending.find(peerFilter);
    
    // 비교군 데이터 표준 카테고리로 매핑
    let peerCategoryData = {
      '식비': { totalAmount: 0, count: 0 },
      '교통': { totalAmount: 0, count: 0 },
      '주거': { totalAmount: 0, count: 0 },
      '의료': { totalAmount: 0, count: 0 },
      '문화': { totalAmount: 0, count: 0 },
      '의류': { totalAmount: 0, count: 0 },
      '기타': { totalAmount: 0, count: 0 }
    };
    
    peerData.forEach(item => {
      const originalCategory = item.card_tpbuz_nm_1 || '';
      const category = categoryMapping[originalCategory] || '기타';
      
      peerCategoryData[category].totalAmount += item.total_spent;
      peerCategoryData[category].count += 1;
    });
    
    // 데이터가 있는 카테고리만 필터링
    const activeCategories = Object.keys(userCategoryData)
      .filter(category => 
        userCategoryData[category].count > 0 || 
        peerCategoryData[category].count > 0
      );
    
    // 카테고리별 사용자 vs 비교군 비교
    const categoryComparison = activeCategories.map(category => ({
      category,
      userAmount: Math.round(userCategoryData[category].totalAmount),
      peerAmount: peerCategoryData[category].count > 0 
        ? Math.round(peerCategoryData[category].totalAmount / peerCategoryData[category].count)
        : 0,
      difference: Math.round(userCategoryData[category].totalAmount - 
        (peerCategoryData[category].count > 0 
          ? peerCategoryData[category].totalAmount / peerCategoryData[category].count
          : 0))
    }));
    
    // 총 소비 계산
    const userTotal = Object.values(userCategoryData)
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    const peerAverage = Object.values(peerCategoryData)
      .reduce((sum, category) => {
        return sum + (category.count > 0 
          ? category.totalAmount / category.count 
          : 0);
      }, 0);
    
    logToFile(`사용자 소비 분석 완료: 사용자 ID ${userId}`);
    
    res.json({
      success: true,
      data: {
        userSpending: Math.round(userTotal),
        peerAverage: Math.round(peerAverage),
        difference: Math.round(userTotal - peerAverage),
        categoryComparison,
        userInfo: {
          ageGroup: `${userAge * 10}대`,
          gender: user.gender
        }
      }
    });
  } catch (error) {
    logToFile(`사용자 소비 분석 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자 월별 소비 통계
const getUserMonthlyStats = async (req, res) => {
  try {
    const { userId, year, month } = req.query;
    
    logToFile(`사용자 월별 소비 통계 조회 요청: 사용자 ID ${userId}, 년도 ${year}, 월 ${month}`);
    
    if (!userId || !year || !month) {
      return res.status(400).json({ 
        success: false, 
        message: '사용자 ID, 연도, 월은 필수 매개변수입니다.' 
      });
    }
    
    // 해당 월의 시작일과 종료일 계산
    const monthStr = month.toString().padStart(2, '0');
    const startDate = `${year}${monthStr}01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}${monthStr}${lastDay}`;
    
    // 월 총 지출 통계
    const monthlyTotal = await UserSpending.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // 수정: 올바른 ObjectId 사용
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
    const categorySummary = await UserSpending.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // 수정: 올바른 ObjectId 사용
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
    const dailySummary = await UserSpending.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // 수정: 올바른 ObjectId 사용
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
    
    logToFile(`사용자 월별 소비 통계 조회 완료`);
    
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
    logToFile(`사용자 월별 소비 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자별 소비 대시보드 데이터
const getUserDashboardStats = async (req, res) => {
  try {
    const { userId } = req.query;
    
    logToFile(`사용자 대시보드 통계 요청: 사용자 ID ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID는 필수 매개변수입니다.'
      });
    }
    
    // 전체 소비 금액
    const totalSpending = await UserSpending.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) } // 수정: 올바른 ObjectId 사용
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total_spent' },
          count: { $sum: 1 },
          avg: { $avg: '$total_spent' }
        }
      }
    ]);
    
    // 상위 5개 업종
    const topCategories = await UserSpending.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) } // 수정: 올바른 ObjectId 사용
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
      },
      {
        $limit: 5
      }
    ]);
    
    // 최근 3개월 월별 소비 추이
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const formatYearMonth = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}${month}`;
    };
    
    const threeMonthsAgoStr = formatYearMonth(threeMonthsAgo);
    const currentMonthStr = formatYearMonth(today);
    
    const monthlyTrend = await UserSpending.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // 수정: 올바른 ObjectId 사용
          ta_ymd: { $gte: threeMonthsAgoStr + '01', $lte: currentMonthStr + '31' }
        }
      },
      {
        $project: {
          yearMonth: { $substr: ['$ta_ymd', 0, 6] },
          total_spent: 1
        }
      },
      {
        $group: {
          _id: '$yearMonth',
          total: { $sum: '$total_spent' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const formattedMonthlyTrend = monthlyTrend.map(month => {
      const yearStr = month._id.substring(0, 4);
      const monthStr = month._id.substring(4, 6);
      
      return {
        yearMonth: `${yearStr}-${monthStr}`,
        year: parseInt(yearStr),
        month: parseInt(monthStr),
        total: month.total,
        count: month.count
      };
    });
    
    logToFile(`사용자 대시보드 통계 조회 완료`);
    
    res.json({
      success: true,
      data: {
        totalSpending: totalSpending[0] || { total: 0, count: 0, avg: 0 },
        topCategories: topCategories.map(item => ({
          category: item._id,
          totalSpent: item.total,
          count: item.count
        })),
        monthlyTrend: formattedMonthlyTrend
      }
    });
  } catch (error) {
    logToFile(`사용자 대시보드 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 여러 개의 소비 데이터 일괄 추가
const bulkAddUserSpendings = async (req, res) => {
  try {
    logToFile(`사용자 소비 데이터 일괄 추가 요청: 사용자 ID ${req.body.userId}`);
    
    const { userId, spendings } = req.body;
    
    if (!userId || !spendings || !Array.isArray(spendings) || spendings.length === 0) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID와 소비 데이터 배열은 필수 항목입니다.'
      });
    }
    
    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      logToFile(`사용자를 찾을 수 없음: ID ${userId}`, 'ERROR');
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 소비 데이터 일괄 추가
    const spendingsWithUserId = spendings.map(spending => ({
      ...spending,
      userId
    }));
    
    const insertedSpendings = await UserSpending.insertMany(spendingsWithUserId);
    
    logToFile(`사용자 소비 데이터 일괄 추가 완료: ${insertedSpendings.length}건`);
    
    res.status(201).json({
      success: true,
      message: `${insertedSpendings.length}건의 사용자 소비 데이터가 추가되었습니다.`,
      count: insertedSpendings.length
    });
  } catch (error) {
    logToFile(`사용자 소비 데이터 일괄 추가 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  addUserSpending,
  getUserSpendingList,
  getUserSpendingById,
  updateUserSpending,
  deleteUserSpending,
  getUserSpendingAnalysis,
  getUserMonthlyStats,
  getUserDashboardStats,
  bulkAddUserSpendings
};