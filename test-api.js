const axios = require('axios');

async function testApi() {
  try {
    console.log('API 서버 테스트 중...');
    
    // 기본 API 접속 테스트
    try {
      const response = await axios.get('http://localhost:5000');
      console.log('기본 API 응답:', response.data);
    } catch (error) {
      console.error('기본 API 오류:', error.message);
    }
    
<<<<<<< HEAD
=======
    // 회원가입 API 테스트
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: '테스트 사용자'
      });
      console.log('회원가입 API 응답:', registerResponse.data);
    } catch (error) {
      console.error('회원가입 API 오류:', error.message);
      console.error('오류 응답:', error.response?.data || '응답 데이터 없음');
    }
    
    // 일반 로그인 API 테스트
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('일반 로그인 API 응답:', loginResponse.data);
      
      // 로그인 성공 시 토큰을 저장하여 다음 요청에 사용
      if (loginResponse.data.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
      }
    } catch (error) {
      console.error('일반 로그인 API 오류:', error.message);
      console.error('오류 응답:', error.response?.data || '응답 데이터 없음');
    }
    
>>>>>>> feature
    // 소비 예측 API 테스트
    try {
      const predictionResponse = await axios.get('http://localhost:5000/api/spending/stats/prediction', {
        params: { year: 2025, month: 4 }
      });
      console.log('소비 예측 API 응답:', predictionResponse.data);
    } catch (error) {
      console.error('소비 예측 API 오류:', error.message);
    }
    
    // 복지 서비스 API 테스트
    try {
      const welfareResponse = await axios.get('http://localhost:5000/api/welfare');
      console.log('복지 서비스 API 응답:', welfareResponse.data);
    } catch (error) {
      console.error('복지 서비스 API 오류:', error.message);
    }
    
    // 개발용 로그인 API 테스트
    try {
<<<<<<< HEAD
      const loginResponse = await axios.post('http://localhost:5000/api/auth/dev-login', {
        email: 'example@example.com'
      });
      console.log('개발용 로그인 API 응답:', loginResponse.data);
=======
      const devLoginResponse = await axios.post('http://localhost:5000/api/auth/dev-login', {
        email: 'example@example.com'
      });
      console.log('개발용 로그인 API 응답:', devLoginResponse.data);
>>>>>>> feature
    } catch (error) {
      console.error('개발용 로그인 API 오류:', error.message);
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
  }
}

testApi();