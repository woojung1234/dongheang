import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  // 서버의 실제 URL로 변경 (5000이 포트임을 확인했으니 유지)
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('token');
    
    // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 성공적인 응답 처리
    return response;
  },
  (error) => {
    // 오류 응답 처리
    console.error('API 오류:', error);
    
    // 토큰 만료 (401) 처리
    if (error.response && error.response.status === 401) {
      // 로컬 스토리지 클리어
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;