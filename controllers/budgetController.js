// controllers/budgetController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const User = require('../models/User');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  // 로그 디렉토리 확인 및 생성
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  
  fs.appendFile(path.join(logDir, 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 예산 설정 또는 업데이트
const setBudget = async (req, res) => {
  try {
    const { userId, amount, month, year, categories } = req.body;
    
    logToFile(`예산 설정 요청: 사용자 ID ${userId}, 금액 ${amount}, ${year}년 ${month}월`);
    
    // 필수 필드 검증
    if (!userId || !amount || !month || !year) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID, 금액, 월, 연도는 필수 항목입니다.'
      });
    }
    
    // 금액 유효성 검사
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: '예산 금액은 0 이상의 숫자여야 합니다.'
      });
    }
    
    // 월, 연도 유효성 검사
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: '월은 1에서 12 사이의 숫자여야 합니다.'
      });
    }
    
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        message: '연도는 유효한 범위 내에 있어야 합니다.'
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
    
    // 기존 예산 확인
    let budget = await Budget.findOne({
      userId,
      month: parseInt(month),
      year: parseInt(year)
    });
    
    if (budget) {
      // 예산 업데이트
      budget = await Budget.findOneAndUpdate(
        {
          userId,
          month: parseInt(month),
          year: parseInt(year)
        },
        {
          amount: parseInt(amount),
          categories: categories || {},
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      logToFile(`예산 업데이트 완료: ${budget._id}`);
    } else {
      // 새 예산 생성
      budget = await Budget.create({
        userId,
        amount: parseInt(amount),
        month: parseInt(month),
        year: parseInt(year),
        categories: categories || {}
      });
      
      logToFile(`새 예산 생성 완료: ${budget._id}`);
    }
    
    res.json({
      success: true,
      data: budget,
      message: '예산이 성공적으로 설정되었습니다.'
    });
  } catch (error) {
    logToFile(`예산 설정 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '예산 설정 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 현재 예산 조회
const getCurrentBudget = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // 현재 날짜 정보
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    logToFile(`현재 예산 조회 요청: 사용자 ID ${userId}, ${currentYear}년 ${currentMonth}월`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID는 필수 매개변수입니다.'
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
    
    // 현재 월의 예산 조회
    const budget = await Budget.findOne({
      userId,
      month: currentMonth,
      year: currentYear
    });
    
    if (!budget) {
      return res.json({
        success: true,
        data: {
          amount: 0,
          month: currentMonth,
          year: currentYear,
          categories: {}
        },
        message: '설정된 예산이 없습니다.'
      });
    }
    
    logToFile(`현재 예산 조회 완료: ${budget._id}`);
    
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    logToFile(`현재 예산 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '예산 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 특정 월의 예산 조회
const getBudgetByMonth = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    
    logToFile(`특정 월 예산 조회 요청: 사용자 ID ${userId}, ${year}년 ${month}월`);
    
    if (!userId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID, 월, 연도는 필수 매개변수입니다.'
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
    
    // 해당 월의 예산 조회
    const budget = await Budget.findOne({
      userId,
      month: parseInt(month),
      year: parseInt(year)
    });
    
    if (!budget) {
      return res.json({
        success: true,
        data: {
          amount: 0,
          month: parseInt(month),
          year: parseInt(year),
          categories: {}
        },
        message: '설정된 예산이 없습니다.'
      });
    }
    
    logToFile(`특정 월 예산 조회 완료: ${budget._id}`);
    
    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    logToFile(`특정 월 예산 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '예산 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 예산 삭제
const deleteBudget = async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    
    logToFile(`예산 삭제 요청: 사용자 ID ${userId}, ${year}년 ${month}월`);
    
    if (!userId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID, 월, 연도는 필수 항목입니다.'
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
    
    // 예산 삭제
    const result = await Budget.findOneAndDelete({
      userId,
      month: parseInt(month),
      year: parseInt(year)
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '해당 월의 예산이 존재하지 않습니다.'
      });
    }
    
    logToFile(`예산 삭제 완료: 사용자 ID ${userId}, ${year}년 ${month}월`);
    
    res.json({
      success: true,
      message: '예산이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    logToFile(`예산 삭제 오류: ${error.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      message: '예산 삭제 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  setBudget,
  getCurrentBudget,
  getBudgetByMonth,
  deleteBudget
};