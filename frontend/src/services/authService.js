import api from './api';

// 로그인 상태 확인
export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/check');
    return response.data;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    throw error;
  }
};

// 카카오 로그인 URL 가져오기
export const getKakaoLoginUrl = () => {
  return `${api.defaults.baseURL}/auth/kakao`;
};

// 토큰으로 로그인 처리 (콜백 URL에서 호출)
export const loginWithToken = (token) => {
  // 토큰 저장
  localStorage.setItem('token', token);
  
  // 사용자 정보 가져오기
  return checkAuth()
    .then(data => {
      if (data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
      }
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    });
};

// 로그아웃
export const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    // 오류가 발생해도 로컬 스토리지 항목은 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

// 개발용 로그인 (실제 배포 시에는 제거)
export const devLogin = async (email) => {
  try {
    const response = await api.post('/auth/dev-login', { email });
    const { token, user } = response.data;
    
    // 토큰과 사용자 정보 저장
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  } catch (error) {
    console.error('개발용 로그인 오류:', error);
    throw error;
  }
};

// 현재 로그인된 사용자 가져오기
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// 로그인 여부 확인
export const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
};
