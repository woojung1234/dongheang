import axios from 'axios';

// 환경에 따른 baseURL 설정
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return ''; // 프로덕션 환경에서는 상대 경로 사용
  }
  
  // Docker 환경인 경우
  if (window.location.hostname === 'localhost' && window.location.port === '3000') {
    return 'http://localhost:5000';
  }
  
  return ''; // 기본값은 상대 경로
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL: getBaseUrl(),
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
    
    console.log('API 요청:', config.method, config.url, config.params || config.data);
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
    console.log('API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // 오류 응답 처리
    console.error('API 오류:', error.config?.url, error.response?.status, error.message);
    
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