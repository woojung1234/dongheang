import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaRegEnvelope, FaSeedling } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { isAuthenticated, login, register, devLogin, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    // 최소 8자, 하나 이상의 문자와 하나 이상의 숫자
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };
  
  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // 실시간 입력 유효성 검사
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        if (!validateEmail(value)) {
          errors.email = '유효한 이메일 주소를 입력해주세요.';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!validatePassword(value)) {
          errors.password = '비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.';
        } else {
          delete errors.password;
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        } else {
          delete errors.confirmPassword;
        }
        break;
      case 'name':
        if (value.trim().length < 2) {
          errors.name = '이름은 최소 2자 이상이어야 합니다.';
        } else {
          delete errors.name;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 해당 필드 상태 업데이트
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'name':
        setName(value);
        break;
      default:
        break;
    }
    
    // 유효성 검사 실행
    validateField(name, value);
  };
  
  // 일반 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 이메일, 비밀번호 유효성 검사
    if (!validateField('email', email) || !validateField('password', password)) {
      return;
    }
    
    setLoading(true);
    
    const success = await login(email, password);
    
    setLoading(false);
    
    if (success) {
      navigate('/');
    }
  };
  
  // 회원가입
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 모든 필드 유효성 검사
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
    const isNameValid = validateField('name', name);
    
    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isNameValid) {
      return;
    }
    
    setLoading(true);
    
    const result = await register({ email, password, name });
    
    setLoading(false);
    
    if (result.success) {
      // 회원가입 성공 후 프로필 설정 페이지로 이동
      navigate('/register-profile');
    }
  };
  
  // 개발용 간편 로그인
  const handleDevLogin = async () => {
    setLoading(true);
    
    const success = await devLogin('dev@example.com');
    
    setLoading(false);
    
    if (success) {
      navigate('/');
    }
  };
  
  // 모드 전환 (로그인 <-> 회원가입)
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFieldErrors({});
    // 폼 초기화
    if (isLogin) {
      // 회원가입 모드로 전환 시
      setConfirmPassword('');
      setName('');
    }
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
              name="email"
              type="email" 
              value={email}
              onChange={handleChange}
              placeholder="이메일 주소"
              required
            />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">
                <FaUser className="input-icon" />
                이름
              </label>
              <input 
                id="name"
                name="name"
                type="text" 
                value={name}
                onChange={handleChange}
                placeholder="이름"
                required
              />
              {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              비밀번호
            </label>
            <input 
              id="password"
              name="password"
              type="password" 
              value={password}
              onChange={handleChange}
              placeholder="비밀번호"
              required
            />
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="input-icon" />
                비밀번호 확인
              </label>
              <input 
                id="confirmPassword"
                name="confirmPassword"
                type="password" 
                value={confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 확인"
                required
              />
              {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
            </div>
          )}
          
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