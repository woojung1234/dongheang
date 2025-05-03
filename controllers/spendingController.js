const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Spending = require('../models/Spending');
const User = require('../models/User');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\
`;
  
  fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 인천 소비 통계 API 호출 함수
const fetchIncheonStatisticsFromAPI = async (params = {}) => {
  try {
    // API 키는 이미 URL 인코딩된 상태이므로 추가 인코딩하지 않음
    const apiKey = process.env.INCHEON_API_KEY;
    const url = `https://api.odcloud.kr/api/15108981/v1/uddi:7a8321e1-ea90-41e7-9b5f-e89f36d5bd9f?page=1&perPage=100&serviceKey=${apiKey}`;
    
    logToFile('인천 소비 통계 API 호출 시작');
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // API 응답 확인
    if (!response.data) {
      throw new Error('API 응답에 데이터가 없습니다.');
    }
    
    logToFile(`인천 소비 통계 API 호출 완료: ${response.data.currentCount || 0}/${response.data.totalCount || 0} 건의 데이터 수신`);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // API 오류 응답
      logToFile(`인천 소비 통계 API 오류 응답: 상태 코드 ${error.response.status}, 메시지: ${JSON.stringify(error.response.data)}`, 'ERROR');
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못함
      logToFile(`인천 소비 통계 API 요청 오류: 응답 없음`, 'ERROR');
    } else {
      // 요청 설정 중 오류 발생
      logToFile(`인천 소비 통계 API 호출 전 오류: ${error.message}`, 'ERROR');
    }
    
    throw new Error('인천 소비 통계 API 호출 중 오류가 발생했습니다: ' + error.message);
  }
};

// 소비 내역 추가
const addSpending = async (req, res) => {
  try {
    logToFile(`소비 내역 추가 요청: 사용자 ID ${req.user.id}`);
    
    const { amount, category, description, date, paymentMethod, isRecurring } = req.body;
    
    // 필수 필드 확인
    if (!amount || !category) {
      return res.status(400).json({ success: false, message: '금액과 카테고리는 필수 항목입니다.' });
    }
    
    // 소비 내역 추가
    let spending;
    try {
      spending = await Spending.create({
        userId: req.user.id,
        amount,
        category,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || '카드',
        isRecurring: isRecurring || false
      });
      
      logToFile(`소비 내역 추가 완료: ID ${spending._id}`);
    } catch (dbError) {
      logToFile(`데이터베이스 저장 오류: ${dbError.message}`, 'ERROR');
      
      // 저장 실패 시 임시 ID 사용
      spending = {
        _id: Date.now().toString(),
        userId: req.user.id,
        amount,
        category,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || '카드',
        isRecurring: isRecurring || false
      };
      
      logToFile('임시 소비 내역 생성');
    }
    
    res.status(201).json({
      success: true,
      data: spending,
      message: '소비 내역이 추가되었습니다.'
    });
  } catch (error) {
    logToFile(`소비 내역 추가 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 내역 목록 조회
const getSpendingList = async (req, res) => {
  try {
    logToFile(`소비 내역 목록 조회 요청: 사용자 ID ${req.user.id}`);
    
    const { 
      startDate, 
      endDate, 
      category, 
      minAmount, 
      maxAmount, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter = { userId: req.user.id };
    
    // 날짜 필터
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // 카테고리 필터
    if (category) filter.category = category;
    
    // 금액 범위 필터
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }
    
    let spendings = [];
    let total = 0;
    
    try {
      // 소비 내역 조회
      spendings = await Spending.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // 전체 내역 수 조회
      total = await Spending.countDocuments(filter);
      
      logToFile(`소비 내역 목록 조회 완료: ${spendings.length}건 조회됨`);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      
      // 더미 데이터 제공
      spendings = getDummySpendingData();
      total = spendings.length;
      
      logToFile(`더미 소비 내역 데이터 사용: ${spendings.length}건`);
    }
    
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
    logToFile(`소비 내역 목록 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 소비 내역 조회
const getSpendingById = async (req, res) => {
  try {
    logToFile(`특정 소비 내역 조회 요청: ID ${req.params.id}`);
    
    let spending;
    
    try {
      spending = await Spending.findById(req.params.id);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      
      // 더미 데이터에서 검색
      const dummyData = getDummySpendingData();
      spending = dummyData.find(item => item.id === req.params.id);
    }
    
    if (!spending) {
      logToFile(`소비 내역을 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 내역을 찾을 수 없습니다.' });
    }
    
    // 본인 소비 내역인지 확인
    if (spending.userId.toString() !== req.user.id) {
      logToFile(`권한 없음: 소비 내역 ID ${req.params.id}, 요청 사용자 ID ${req.user.id}`, 'ERROR');
      return res.status(403).json({ success: false, message: '해당 소비 내역에 접근할 권한이 없습니다.' });
    }
    
    logToFile(`특정 소비 내역 조회 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: spending
    });
  } catch (error) {
    logToFile(`특정 소비 내역 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 내역 수정
const updateSpending = async (req, res) => {
  try {
    logToFile(`소비 내역 수정 요청: ID ${req.params.id}`);
    
    const { amount, category, description, date, paymentMethod, isRecurring } = req.body;
    
    // 소비 내역 확인
    let spending;
    
    try {
      spending = await Spending.findById(req.params.id);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 내역을 찾을 수 없습니다.' });
    }
    
    if (!spending) {
      logToFile(`소비 내역을 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 내역을 찾을 수 없습니다.' });
    }
    
    // 본인 소비 내역인지 확인
    if (spending.userId.toString() !== req.user.id) {
      logToFile(`권한 없음: 소비 내역 ID ${req.params.id}, 요청 사용자 ID ${req.user.id}`, 'ERROR');
      return res.status(403).json({ success: false, message: '해당 소비 내역을 수정할 권한이 없습니다.' });
    }
    
    // 업데이트 데이터 구성
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    
    // 소비 내역 업데이트
    let updatedSpending;
    
    try {
      updatedSpending = await Spending.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
      
      logToFile(`소비 내역 수정 완료: ID ${req.params.id}`);
    } catch (dbError) {
      logToFile(`데이터베이스 업데이트 오류: ${dbError.message}`, 'ERROR');
      
      // 업데이트 실패 시 원본 데이터 반환
      updatedSpending = { ...spending._doc, ...updateData };
      logToFile('로컬 소비 내역 업데이트');
    }
    
    res.json({
      success: true,
      data: updatedSpending,
      message: '소비 내역이 수정되었습니다.'
    });
  } catch (error) {
    logToFile(`소비 내역 수정 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 소비 내역 삭제
const deleteSpending = async (req, res) => {
  try {
    logToFile(`소비 내역 삭제 요청: ID ${req.params.id}`);
    
    // 소비 내역 확인
    let spending;
    
    try {
      spending = await Spending.findById(req.params.id);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 내역을 찾을 수 없습니다.' });
    }
    
    if (!spending) {
      logToFile(`소비 내역을 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '소비 내역을 찾을 수 없습니다.' });
    }
    
    // 본인 소비 내역인지 확인
    if (spending.userId.toString() !== req.user.id) {
      logToFile(`권한 없음: 소비 내역 ID ${req.params.id}, 요청 사용자 ID ${req.user.id}`, 'ERROR');
      return res.status(403).json({ success: false, message: '해당 소비 내역을 삭제할 권한이 없습니다.' });
    }
    
    // 소비 내역 삭제
    try {
      await Spending.findByIdAndDelete(req.params.id);
      logToFile(`소비 내역 삭제 완료: ID ${req.params.id}`);
    } catch (dbError) {
      logToFile(`데이터베이스 삭제 오류: ${dbError.message}`, 'ERROR');
      // 삭제 실패는 치명적이므로 오류 반환
      return res.status(500).json({ success: false, message: '소비 내역 삭제 중 오류가 발생했습니다.' });
    }
    
    res.json({
      success: true,
      message: '소비 내역이 삭제되었습니다.'
    });
  } catch (error) {
    logToFile(`소비 내역 삭제 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 월별 소비 통계
const getMonthlyStats = async (req, res) => {
  try {
    logToFile(`월별 소비 통계 요청: 사용자 ID ${req.user.id}`);
    
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ success: false, message: '연도와 월을 지정해주세요.' });
    }
    
    // 선택한 월의 시작일과 종료일
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    let categoryStats = [];
    let totalSpending = 0;
    let dailyStats = [];
    
    try {
      // 카테고리별 소비 합계 조회
      categoryStats = await Spending.aggregate([
        {
          $match: {
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);
      
      // 총 소비 금액
      totalSpending = categoryStats.reduce((sum, stat) => sum + stat.total, 0);
      
      // 일별 소비 추이
      dailyStats = await Spending.aggregate([
        {
          $match: {
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: '$date' },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
      
      logToFile(`소비 통계 데이터베이스 조회 완료: ${categoryStats.length}개 카테고리, 총 ${totalSpending}원`);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      
      // 더미 데이터 사용
      const dummyStats = getDummyMonthlyStats(parseInt(year), parseInt(month));
      categoryStats = dummyStats.categorySummary.map(item => ({
        _id: item.category,
        total: item.total,
        count: item.count
      }));
      totalSpending = dummyStats.totalSpending;
      dailyStats = dummyStats.dailySummary.map(item => ({
        _id: item.day,
        total: item.total
      }));
      
      logToFile(`더미 소비 통계 데이터 사용: ${categoryStats.length}개 카테고리, 총 ${totalSpending}원`);
    }
    
    // 카테고리별 비율 계산
    const categorySummary = categoryStats.map(stat => ({
      category: stat._id,
      total: stat.total,
      count: stat.count,
      percentage: totalSpending ? Math.round((stat.total / totalSpending) * 100) : 0
    }));
    
    // 일별 데이터 포맷팅
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const dailySummary = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyStats.find(stat => stat._id === day);
      dailySummary.push({
        day,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        total: dayData ? dayData.total : 0
      });
    }
    
    logToFile(`월별 소비 통계 응답 준비 완료`);
    
    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        totalSpending,
        categorySummary,
        dailySummary
      }
    });
  } catch (error) {
    logToFile(`월별 소비 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 동년배 비교 통계
const getComparisonStats = async (req, res) => {
  try {
    logToFile(`동년배 비교 통계 요청: 사용자 ID ${req.user.id}`);
    
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ success: false, message: '연도와 월을 지정해주세요.' });
    }
    
    // 선택한 월의 시작일과 종료일
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    // 사용자 정보 조회 (연령대 확인용)
    let user;
    let userAge;
    let userGender;
    
    try {
      user = await User.findById(req.user.id);
      userAge = user?.age || 30; // 기본값
      userGender = user?.gender || 'male'; // 기본값
    } catch (dbError) {
      logToFile(`사용자 정보 조회 오류: ${dbError.message}`, 'ERROR');
      userAge = 30; // 기본값
      userGender = 'male'; // 기본값
    }
    
    // 연령대 그룹 설정
    let ageGroup = '';
    if (userAge < 30) ageGroup = '20대';
    else if (userAge < 40) ageGroup = '30대';
    else if (userAge < 50) ageGroup = '40대';
    else if (userAge < 60) ageGroup = '50대';
    else ageGroup = '60대 이상';
    
    // 성별 매핑
    const mappedGender = userGender === 'male' ? '남' : '여';
    
    // 사용자 소비 데이터 조회
    let userSpending = 0;
    let userCategoryData = [];
    
    try {
      // 총 소비 금액 조회
      const userTotalResult = await Spending.aggregate([
        {
          $match: {
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      userSpending = userTotalResult.length > 0 ? userTotalResult[0].total : 0;
      
      // 카테고리별 소비 조회
      userCategoryData = await Spending.aggregate([
        {
          $match: {
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      logToFile(`사용자 소비 데이터 조회 완료: 총 ${userSpending}원, ${userCategoryData.length}개 카테고리`);
    } catch (dbError) {
      logToFile(`소비 데이터 조회 오류: ${dbError.message}`, 'ERROR');
      
      // 더미 데이터 사용
      const dummyUserData = getDummyUserSpendingData();
      userSpending = dummyUserData.totalSpending;
      userCategoryData = Object.entries(dummyUserData.categoryData).map(([category, amount]) => ({
        _id: category,
        total: amount
      }));
      
      logToFile(`더미 사용자 소비 데이터 사용: 총 ${userSpending}원`);
    }
    
    // 동년배 통계 데이터 조회 (공공 API)
    let peerData;
    
    try {
      // 공공 API 호출
      const apiResponse = await fetchIncheonStatisticsFromAPI();
      
      // 연령대 및 성별 필터링
      const filteredData = apiResponse.data.filter(item => 
        item.연령대 === ageGroup && item.성별 === mappedGender
      );
      
      if (filteredData.length === 0) {
        throw new Error('해당 연령대/성별 데이터 없음');
      }
      
      peerData = filteredData[0];
      logToFile(`동년배 통계 API 데이터 조회 완료: ${ageGroup}, ${mappedGender}`);
    } catch (apiError) {
      logToFile(`동년배 통계 API 오류: ${apiError.message}`, 'ERROR');
      
      // 더미 데이터 사용
      peerData = getDummyPeerData(ageGroup, mappedGender);
      logToFile(`더미 동년배 통계 데이터 사용: ${ageGroup}, ${mappedGender}`);
    }
    
    // 동년배 총 소비 계산
    const peerTotal = 
      peerData.식비 + 
      peerData.교통 + 
      peerData.주거 + 
      peerData.의료 + 
      peerData.문화 + 
      peerData.의류 + 
      peerData.기타;
    
    // 카테고리 매핑 (API -> 앱 내 카테고리)
    const categoryMapping = {
      '식비': '식비',
      '교통': '교통',
      '주거': '주거',
      '의료': '의료',
      '문화': '문화',
      '의류': '의류',
      '기타': '기타'
    };
    
    // 카테고리별 비교 데이터 구성
    const categoryComparison = Object.entries(categoryMapping).map(([apiCategory, appCategory]) => {
      const userCategoryItem = userCategoryData.find(item => item._id === appCategory);
      
      return {
        category: appCategory,
        userAmount: userCategoryItem ? userCategoryItem.total : 0,
        peerAmount: peerData[apiCategory] || 0
      };
    });
    
    logToFile(`동년배 비교 통계 응답 준비 완료`);
    
    res.json({
      success: true,
      data: {
        userSpending,
        peerAverage: peerTotal,
        categoryComparison,
        userInfo: {
          age: userAge,
          ageGroup,
          gender: userGender
        }
      }
    });
  } catch (error) {
    logToFile(`동년배 비교 통계 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 더미 소비 내역 데이터
const getDummySpendingData = () => {
  return [
    {
      id: '1',
      amount: 15000,
      category: '식비',
      description: '점심식사',
      date: '2025-04-20',
      paymentMethod: '카드',
      userId: 'anonymous'
    },
    {
      id: '2',
      amount: 30000,
      category: '교통',
      description: '택시비',
      date: '2025-04-18',
      paymentMethod: '카드',
      userId: 'anonymous'
    },
    {
      id: '3',
      amount: 50000,
      category: '의료',
      description: '병원 진료비',
      date: '2025-04-15',
      paymentMethod: '현금',
      userId: 'anonymous'
    },
    {
      id: '4',
      amount: 25000,
      category: '문화',
      description: '영화 관람',
      date: '2025-04-10',
      paymentMethod: '카드',
      userId: 'anonymous'
    }
  ];
};

// 더미 월별 통계 데이터
const getDummyMonthlyStats = (year, month) => {
  return {
    year,
    month,
    totalSpending: 1250000,
    categorySummary: [
      { category: '식비', total: 450000, count: 15, percentage: 36 },
      { category: '교통', total: 150000, count: 8, percentage: 12 },
      { category: '주거', total: 300000, count: 2, percentage: 24 },
      { category: '의료', total: 80000, count: 3, percentage: 6 },
      { category: '문화', total: 120000, count: 4, percentage: 10 },
      { category: '의류', total: 50000, count: 2, percentage: 4 },
      { category: '기타', total: 100000, count: 5, percentage: 8 }
    ],
    dailySummary: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
      total: Math.floor(Math.random() * 50000)
    }))
  };
};

// 더미 사용자 소비 데이터
const getDummyUserSpendingData = () => {
  return {
    totalSpending: 1250000,
    categoryData: {
      '식비': 450000,
      '교통': 150000,
      '주거': 300000,
      '의료': 80000,
      '문화': 120000,
      '의류': 50000,
      '기타': 100000
    }
  };
};
// 더미 동년배 소비 데이터
const getDummyPeerData = (ageGroup, gender) => {
  // 연령대/성별별 더미 데이터
  const dummyData = {
    '20대': {
      '남': {
        식비: 500000,
        교통: 200000,
        주거: 350000,
        의료: 70000,
        문화: 250000,
        의류: 150000,
        기타: 130000
      },
      '여': {
        식비: 450000,
        교통: 180000,
        주거: 350000,
        의료: 90000,
        문화: 230000,
        의류: 300000,
        기타: 120000
      }
    },
    '30대': {
      '남': {
        식비: 550000,
        교통: 230000,
        주거: 500000,
        의료: 100000,
        문화: 200000,
        의류: 100000,
        기타: 150000
      },
      '여': {
        식비: 520000,
        교통: 200000,
        주거: 500000,
        의료: 120000,
        문화: 180000,
        의류: 250000,
        기타: 130000
      }
    },
    '40대': {
      '남': {
        식비: 600000,
        교통: 250000,
        주거: 600000,
        의료: 150000,
        문화: 180000,
        의류: 100000,
        기타: 200000
      },
      '여': {
        식비: 550000,
        교통: 230000,
        주거: 600000,
        의료: 180000,
        문화: 150000,
        의류: 200000,
        기타: 180000
      }
    },
    '50대': {
      '남': {
        식비: 550000,
        교통: 230000,
        주거: 550000,
        의료: 200000,
        문화: 150000,
        의류: 80000,
        기타: 250000
      },
      '여': {
        식비: 500000,
        교통: 200000,
        주거: 550000,
        의료: 250000,
        문화: 120000,
        의류: 150000,
        기타: 220000
      }
    },
    '60대 이상': {
      '남': {
        식비: 450000,
        교통: 180000,
        주거: 500000,
        의료: 300000,
        문화: 100000,
        의류: 50000,
        기타: 200000
      },
      '여': {
        식비: 400000,
        교통: 150000,
        주거: 500000,
        의료: 350000,
        문화: 80000,
        의류: 100000,
        기타: 170000
      }
    }
  };
  
  // 해당 연령대/성별에 맞는 데이터 반환
  // 데이터가 없으면 기본값으로 30대 남성 데이터 반환
  if (dummyData[ageGroup] && dummyData[ageGroup][gender]) {
    return dummyData[ageGroup][gender];
  } else {
    return dummyData['30대']['남'];
  }
};

// 소비 예측 분석 
const getPredictionAnalysis = async (req, res) => {
  try {
    logToFile(`소비 예측 분석 요청: 사용자 ID ${req.user.id}`);
    
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ success: false, message: '연도와 월을 지정해주세요.' });
    }
    
    // 과거 3개월 데이터 기간 계산
    const endDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 3);
    
    // 사용자 과거 소비 데이터 조회
    let pastSpendings = [];
    
    try {
      pastSpendings = await Spending.find({
        userId: req.user.id,
        date: { $gte: startDate, $lt: endDate }
      }).sort({ date: 1 });
      
      logToFile(`과거 소비 데이터 조회 완료: ${pastSpendings.length}건`);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      
      // 더미 데이터 생성
      const dummyMonths = 3;
      pastSpendings = [];
      
      for (let i = 0; i < dummyMonths; i++) {
        const monthDate = new Date(endDate);
        monthDate.setMonth(monthDate.getMonth() - (dummyMonths - i));
        
        // 월별 더미 데이터 생성
        const monthlyData = getDummyMonthlyStats(
          monthDate.getFullYear(), 
          monthDate.getMonth() + 1
        );
        
        // 카테고리별 데이터 변환
        monthlyData.categorySummary.forEach(category => {
          pastSpendings.push({
            date: new Date(monthDate),
            category: category.category,
            amount: category.total
          });
        });
      }
      
      logToFile(`더미 과거 소비 데이터 생성: ${pastSpendings.length}건`);
    }
    
    // 카테고리별 소비 추세 계산
    const categories = ['식비', '교통', '주거', '의료', '문화', '의류', '기타'];
    const predictionResults = {};
    
    // 각 카테고리별 분석
    for (const category of categories) {
      // 해당 카테고리 과거 데이터
      const categoryData = pastSpendings
        .filter(item => item.category === category)
        .map(item => ({
          month: new Date(item.date).getMonth(),
          amount: item.amount
        }));
      
      // 월별 합계 계산
      const monthlyTotals = {};
      
      categoryData.forEach(item => {
        if (!monthlyTotals[item.month]) {
          monthlyTotals[item.month] = 0;
        }
        monthlyTotals[item.month] += item.amount;
      });
      
      // 월별 합계 배열 생성
      const monthlyAmounts = Object.values(monthlyTotals);
      
      // 단순 평균 예측
      const averageAmount = monthlyAmounts.length > 0 
        ? Math.round(monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length) 
        : 0;
      
      // 추세 기반 예측 (간단한 선형 회귀)
      let trendPrediction = averageAmount;
      
      if (monthlyAmounts.length >= 2) {
        const recentMonths = Math.min(monthlyAmounts.length, 3);
        const recentTrend = [];
        
        for (let i = 1; i < recentMonths; i++) {
          const prevAmount = monthlyAmounts[monthlyAmounts.length - i - 1];
          const currentAmount = monthlyAmounts[monthlyAmounts.length - i];
          const monthlyChange = currentAmount - prevAmount;
          recentTrend.push(monthlyChange);
        }
        
        const avgMonthlyChange = recentTrend.reduce((sum, change) => sum + change, 0) / recentTrend.length;
        trendPrediction = Math.round(monthlyAmounts[monthlyAmounts.length - 1] + avgMonthlyChange);
        
        // 추세가 음수일 경우 최소값 적용
        trendPrediction = Math.max(trendPrediction, Math.round(averageAmount * 0.5));
      }
      
      // 결과 저장
      predictionResults[category] = {
        averagePrediction: averageAmount,
        trendPrediction: trendPrediction,
        pastMonthlyData: monthlyAmounts.map((amount, index) => ({
          month: new Date(startDate.getFullYear(), startDate.getMonth() + index, 1).toISOString().substring(0, 7),
          amount
        }))
      };
    }
    
    // 총 예측 금액 계산
    const totalAvgPrediction = Object.values(predictionResults)
      .reduce((sum, item) => sum + item.averagePrediction, 0);
    
    const totalTrendPrediction = Object.values(predictionResults)
      .reduce((sum, item) => sum + item.trendPrediction, 0);
    
    logToFile(`소비 예측 분석 응답 준비 완료: 평균 기반 ${totalAvgPrediction}원, 추세 기반 ${totalTrendPrediction}원`);
    
    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        totalPrediction: {
          averageBased: totalAvgPrediction,
          trendBased: totalTrendPrediction
        },
        categoryPredictions: predictionResults
      }
    });
  } catch (error) {
    logToFile(`소비 예측 분석 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 추천 예산 계획
const getBudgetRecommendation = async (req, res) => {
  try {
    logToFile(`추천 예산 계획 요청: 사용자 ID ${req.user.id}`);
    
    const { income, savingGoal } = req.query;
    
    if (!income) {
      return res.status(400).json({ success: false, message: '월 소득을 입력해주세요.' });
    }
    
    // 월 소득 및 저축 목표 파싱
    const monthlyIncome = parseInt(income);
    const monthlySavingGoal = savingGoal ? parseInt(savingGoal) : Math.round(monthlyIncome * 0.2); // 기본 저축 목표: 소득의 20%
    
    // 사용자 정보 조회
    let user;
    let userAge = 30; // 기본값
    let userGender = 'male'; // 기본값
    
    try {
      user = await User.findById(req.user.id);
      if (user) {
        userAge = user.age || 30;
        userGender = user.gender || 'male';
      }
    } catch (dbError) {
      logToFile(`사용자 정보 조회 오류: ${dbError.message}`, 'ERROR');
    }
    
    // 연령대 그룹 설정
    let ageGroup = '';
    if (userAge < 30) ageGroup = '20대';
    else if (userAge < 40) ageGroup = '30대';
    else if (userAge < 50) ageGroup = '40대';
    else if (userAge < 60) ageGroup = '50대';
    else ageGroup = '60대 이상';
    
    // 성별 매핑
    const mappedGender = userGender === 'male' ? '남' : '여';
    
    // 동년배 통계 조회
    let peerData;
    
    try {
      // 공공 API 호출
      const apiResponse = await fetchIncheonStatisticsFromAPI();
      
      // 연령대 및 성별 필터링
      const filteredData = apiResponse.data.filter(item => 
        item.연령대 === ageGroup && item.성별 === mappedGender
      );
      
      if (filteredData.length === 0) {
        throw new Error('해당 연령대/성별 데이터 없음');
      }
      
      peerData = filteredData[0];
      logToFile(`동년배 통계 API 데이터 조회 완료: ${ageGroup}, ${mappedGender}`);
    } catch (apiError) {
      logToFile(`동년배 통계 API 오류: ${apiError.message}`, 'ERROR');
      
      // 더미 데이터 사용
      peerData = getDummyPeerData(ageGroup, mappedGender);
      logToFile(`더미 동년배 통계 데이터 사용: ${ageGroup}, ${mappedGender}`);
    }
    
    // 동년배 총 소비 계산
    const peerTotal = 
      peerData.식비 + 
      peerData.교통 + 
      peerData.주거 + 
      peerData.의료 + 
      peerData.문화 + 
      peerData.의류 + 
      peerData.기타;
    
    // 소득 대비 동년배 소비 비율 계산
    const peerRatio = peerTotal / monthlyIncome;
    
    // 예산 조정 필요 여부 확인
    const needsAdjustment = peerTotal + monthlySavingGoal > monthlyIncome;
    
    // 추천 예산 계획 생성
    let recommendedBudget = {};
    const spendableAmount = monthlyIncome - monthlySavingGoal;
    
    if (needsAdjustment) {
      // 조정된 예산: 카테고리별 비율은 유지하되 전체 금액 축소
      const adjustmentRatio = spendableAmount / peerTotal;
      
      recommendedBudget = {
        식비: Math.round(peerData.식비 * adjustmentRatio),
        교통: Math.round(peerData.교통 * adjustmentRatio),
        주거: Math.round(peerData.주거 * adjustmentRatio),
        의료: Math.round(peerData.의료 * adjustmentRatio),
        문화: Math.round(peerData.문화 * adjustmentRatio),
        의류: Math.round(peerData.의류 * adjustmentRatio),
        기타: Math.round(peerData.기타 * adjustmentRatio)
      };
    } else {
      // 동년배 평균 그대로 사용
      recommendedBudget = { ...peerData };
    }
    
    // 여유 자금 계산
    let remainingFunds = monthlyIncome - monthlySavingGoal;
    Object.values(recommendedBudget).forEach(amount => {
      remainingFunds -= amount;
    });
    
    // 음수일 경우 0으로 조정
    remainingFunds = Math.max(0, remainingFunds);
    
    // 예산 조정 제안
    const budgetSuggestions = [];
    
    if (needsAdjustment) {
      budgetSuggestions.push(
        '소득에 비해 동년배 평균 지출이 높습니다. 절약 가능한 카테고리를 찾아보세요.'
      );
      
      // 카테고리별 비중 계산하여 절약 가능한 카테고리 제안
      const categoryRatios = {};
      let maxRatioCategory = '';
      let maxRatio = 0;
      
      Object.entries(peerData).forEach(([category, amount]) => {
        const ratio = amount / peerTotal;
        categoryRatios[category] = ratio;
        
        if (ratio > maxRatio) {
          maxRatio = ratio;
          maxRatioCategory = category;
        }
      });
      
      budgetSuggestions.push(
        `${maxRatioCategory} 지출이 가장 큰 비중(${Math.round(maxRatio * 100)}%)을 차지합니다. 이 부분에서 절약을 고려해보세요.`
      );
    } else if (remainingFunds > monthlyIncome * 0.1) {
      budgetSuggestions.push(
        '여유 자금이 충분합니다. 추가 저축이나 투자를 고려해보세요.'
      );
    }
    
    // 절약 팁 추가
    const savingTips = {
      식비: '식사 계획을 세우고 집에서 요리하면 외식비를 절약할 수 있습니다.',
      교통: '대중교통 이용과 카풀로 교통비를 줄일 수 있습니다.',
      주거: '전기, 수도, 가스 사용을 줄여 공과금을 절약하세요.',
      의료: '정기 검진으로 큰 병을 예방하세요.',
      문화: '무료 문화 행사나 할인 이벤트를 활용하세요.',
      의류: '필요한 옷만 구매하고 세일 기간을 활용하세요.',
      기타: '정기 구독 서비스나 불필요한 지출을 점검하세요.'
    };
    
    // 가장 비중이 큰 카테고리 3개에 대한 팁 추가
    const sortedCategories = Object.entries(recommendedBudget)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => ({
        category,
        tip: savingTips[category]
      }));
    
    logToFile(`추천 예산 계획 응답 준비 완료`);
    
    res.json({
      success: true,
      data: {
        monthlyIncome,
        monthlySavingGoal,
        spendableAmount,
        remainingFunds,
        needsAdjustment,
        recommendedBudget,
        peerAverageBudget: peerData,
        budgetSuggestions,
        savingTipsForTopCategories: sortedCategories,
        userInfo: {
          age: userAge,
          ageGroup,
          gender: userGender
        }
      }
    });
  } catch (error) {
    logToFile(`추천 예산 계획 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  addSpending,
  getSpendingList,
  getSpendingById,
  updateSpending,
  deleteSpending,
  getMonthlyStats,
  getComparisonStats,
  getPredictionAnalysis,
  getBudgetRecommendation
};