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
    logToFile(`성별 통