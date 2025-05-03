import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComment } from 'react-icons/fa';

// 컨텍스트
import AuthContext from '../context/AuthContext';

const Login = () => {
  const { isAuthenticated, loading, error, devLogin, kakaoLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('example@example.com');
  
  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);
  
  // 개발 환경에서의 로그인 (실제 배포 환경에서는 사용 안 함)
  const handleDevLogin = async (e) => {
    e.preventDefault();
    console.log('개발용 로그인 시도:', email);
    
    if (!email) {
      return;
    }
    
    const success = await devLogin(email);
    
    if (success) {
      navigate('/');
    }
  };
  
  // 카카오 로그인
  const handleKakaoLogin = () => {
    console.log('카카오 로그인 시도');
    kakaoLogin();
  };
  
  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>동행</h1>
          <p>대화형 금융 복지 지원 플랫폼</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 카카오 로그인 버튼 */}
        <button 
          className="kakao-login-btn" 
          onClick={handleKakaoLogin}
        >
          <FaComment className="kakao-icon" />
          <span>카카오로 로그인</span>
        </button>
        
        {/* 개발용 로그인 폼 (실제 배포 환경에서는 숨김 처리) */}
        <div className="dev-login-container">
          <hr />
          <p className="dev-login-label">개발용 임시 로그인</p>
          
          <form onSubmit={handleDevLogin} className="dev-login-form">
            <div className="form-group">
              <label>이메일</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                required
              />
            </div>
            <button 
              type="submit" 
              className="dev-login-btn"
            >
              개발용 로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
