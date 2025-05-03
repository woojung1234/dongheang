import api from './api';

// 소비 내역 추가
export const addSpending = async (spendingData) => {
  try {
    const response = await api.post('/spending', spendingData);
    return response.data;
  } catch (error) {
    console.error('소비 내역 추가 오류:', error);
    throw error;
  }
};

// 소비 내역 목록 조회
export const getSpendingList = async (params = {}) => {
  try {
    const response = await api.get('/spending', { params });
    return response.data;
  } catch (error) {
    console.error('소비 내역 목록 조회 오류:', error);
    throw error;
  }
};

// 특정 소비 내역 조회
export const getSpendingById = async (id) => {
  try {
    const response = await api.get(`/spending/${id}`);
    return response.data;
  } catch (error) {
    console.error('특정 소비 내역 조회 오류:', error);
    throw error;
  }
};

// 소비 내역 수정
export const updateSpending = async (id, spendingData) => {
  try {
    const response = await api.put(`/spending/${id}`, spendingData);
    return response.data;
  } catch (error) {
    console.error('소비 내역 수정 오류:', error);
    throw error;
  }
};

// 소비 내역 삭제
export const deleteSpending = async (id) => {
  try {
    const response = await api.delete(`/spending/${id}`);
    return response.data;
  } catch (error) {
    console.error('소비 내역 삭제 오류:', error);
    throw error;
  }
};

// 월별 소비 통계
export const getMonthlyStats = async (year, month) => {
  try {
    const response = await api.get('/spending/stats/monthly', {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error('월별 소비 통계 조회 오류:', error);
    throw error;
  }
};

// 동년배 비교 통계
export const getComparisonStats = async (year, month) => {
  try {
    const response = await api.get('/spending/stats/comparison', {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error('동년배 비교 통계 조회 오류:', error);
    throw error;
  }
};

// 소비 예측 분석
export const getPredictionAnalysis = async (year, month) => {
  try {
    const response = await api.get('/spending/stats/prediction', {
      params: { year, month }
    });
    return response.data;
  } catch (error) {
    console.error('소비 예측 분석 조회 오류:', error);
    throw error;
  }
};

// 추천 예산 계획
export const getBudgetRecommendation = async (income, savingGoal) => {
  try {
    const response = await api.get('/spending/budget/recommendation', {
      params: { income, savingGoal }
    });
    return response.data;
  } catch (error) {
    console.error('추천 예산 계획 조회 오류:', error);
    throw error;
  }
};
