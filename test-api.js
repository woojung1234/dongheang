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
      const loginResponse = await axios.post('http://localhost:5000/api/auth/dev-login', {
        email: 'example@example.com'
      });
      console.log('개발용 로그인 API 응답:', loginResponse.data);
    } catch (error) {
      console.error('개발용 로그인 API 오류:', error.message);
    }
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
  }
}

testApi();