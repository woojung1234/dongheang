import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComment, FaUser, FaLock, FaRegEnvelope, FaSeedling } from 'react-icons/fa';
import api from '../services/api'; // axios 대신 api 서비스 사용
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('example@example.com');
  const [password, setPassword] = useState('testpassword');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  
  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);
  
  // 일반 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      } else {
        setError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.');
      console.error('로그인 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 회원가입
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        name: email.split('@')[0] // 임시로 이메일 앞부분을 이름으로 사용
      });
      
      if (response.data.success) {
        // 회원가입 성공 후 자동 로그인
        const loginResponse = await api.post('/api/auth/login', {
          email,
          password
        });
        
        if (loginResponse.data.success) {
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          navigate('/');
        } else {
          setError('회원가입은 완료되었으나 로그인에 실패했습니다. 다시 로그인해주세요.');
          setIsLogin(true);
        }
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError(err.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.');
      console.error('회원가입 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 개발용 간편 로그인
  const handleDevLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/dev-login', {
        email
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      } else {
        setError(response.data.message || '개발용 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.response?.data?.message || '개발용 로그인 처리 중 오류가 발생했습니다.');
      console.error('개발용 로그인 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 카카오 로그인
  const handleKakaoLogin = () => {
    console.log('카카오 로그인 시도');
    // 백엔드 API 주소 사용
    window.location.href = `${api.defaults.baseURL}/api/auth/kakao`;
  };
  
  // 모드 전환 (로그인 <-> 회원가입)
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>{isLogin ? '로그인 중...' : '회원가입 중...'}</p>
      </div>
    );
  }
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <FaSeedling className="logo-icon" />
            <h1>동행</h1>
          </div>
          <p>대화형 금융 복지 지원 플랫폼</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 로그인/회원가입 폼 */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaRegEnvelope className="input-icon" />
              이메일
            </label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              비밀번호
            </label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </form>
        
        <div className="auth-toggle">
          <button onClick={toggleMode} className="toggle-btn">
            {isLogin ? '계정이 없으신가요? 회원가입 하기' : '이미 계정이 있으신가요? 로그인 하기'}
          </button>
        </div>
        
        <div className="social-login">
          <p className="divider">또는</p>
          
          {/* 카카오 로그인 버튼 */}
          <button 
            className="kakao-login-btn" 
            onClick={handleKakaoLogin}
            type="button"
          >
            <FaComment className="kakao-icon" />
            <span>카카오로 {isLogin ? '로그인' : '회원가입'}</span>
          </button>
        </div>
        
        {/* 개발용 로그인 버튼 */}
        <div className="dev-login-container">
          <hr />
          <p className="dev-login-label">개발용 임시 로그인</p>
          
          <button 
            onClick={handleDevLogin}
            className="dev-login-btn"
            type="button"
          >
            <FaUser className="dev-icon" />
            <span>개발용 로그인 (테스트 계정)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;