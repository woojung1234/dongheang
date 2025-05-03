import api from './api';

// 복지 서비스 목록 조회
export const getWelfareServices = async (params = {}) => {
  try {
    const response = await api.get('/welfare', { params });
    return response.data;
  } catch (error) {
    console.error('복지 서비스 목록 조회 오류:', error);
    throw error;
  }
};

// 특정 복지 서비스 조회
export const getWelfareServiceById = async (id) => {
  try {
    const response = await api.get(`/welfare/${id}`);
    return response.data;
  } catch (error) {
    console.error('특정 복지 서비스 조회 오류:', error);
    throw error;
  }
};

// 복지 서비스 검색
export const searchWelfareServices = async (keyword, params = {}) => {
  try {
    const response = await api.get('/welfare/search', {
      params: { keyword, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('복지 서비스 검색 오류:', error);
    throw error;
  }
};

// 공공데이터 API 동기화
export const syncWelfareServices = async () => {
  try {
    const response = await api.post('/welfare/sync');
    return response.data;
  } catch (error) {
    console.error('복지 서비스 데이터 동기화 오류:', error);
    throw error;
  }
};

// 동년배 통계 가져오기
export const getPeerStatistics = async (age, gender) => {
  try {
    const response = await api.get('/welfare/peer-statistics', {
      params: { age, gender }
    });
    return response.data;
  } catch (error) {
    console.error('동년배 통계 조회 오류:', error);
    throw error;
  }
};
