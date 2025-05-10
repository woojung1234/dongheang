// frontend/src/services/welfareService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// 복지 서비스 목록 조회
export const getWelfareServices = async (category = '', page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/welfare`, {
      params: { 
        category, 
        page, 
        limit 
      }
    });
    return response.data;
  } catch (error) {
    console.error('복지 서비스 목록 조회 오류:', error);
    throw error;
  }
};

// 복지 서비스 검색
export const searchWelfareServices = async (keyword, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/welfare/search`, {
      params: { 
        keyword, 
        page, 
        limit 
      }
    });
    return response.data;
  } catch (error) {
    console.error('복지 서비스 검색 오류:', error);
    throw error;
  }
};

// 복지 서비스 상세 조회
export const getWelfareServiceById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/welfare/${id}`);
    return response.data;
  } catch (error) {
    console.error('복지 서비스 상세 조회 오류:', error);
    throw error;
  }
};

// 복지 서비스 동기화 (관리자 전용)
export const syncWelfareServices = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/welfare/sync`);
    return response.data;
  } catch (error) {
    console.error('복지 서비스 동기화 오류:', error);
    throw error;
  }
};

// 동년배 통계 데이터 조회
export const getPeerStatistics = async (age, gender) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/welfare/peer-statistics`, {
      params: { age, gender }
    });
    return response.data;
  } catch (error) {
    console.error('동년배 통계 데이터 조회 오류:', error);
    throw error;
  }
};

export default {
  getWelfareServices,
  searchWelfareServices,
  getWelfareServiceById,
  syncWelfareServices,
  getPeerStatistics
};