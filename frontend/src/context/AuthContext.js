import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // axios 대신 api 서비스 사용

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 앱 로드 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // 토큰 유효성 검증
        const response = await api.get('/api/auth/check');
        // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
        
        if (response.data.success) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          // 토큰이 유효하지 않은 경우
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // 일반 로그인
  const login = async (email, password) => {
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
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.data.message || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('로그인 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 회원가입
  const register = async (email, password, name) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        name
      });
      
      if (response.data.success) {
        return true;
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('회원가입 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 로그아웃
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };
  
  // 개발용 로그인
  const devLogin = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/dev-login', {
        email
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      } else {
        setError(response.data.message || '개발용 로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '개발용 로그인 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('개발용 로그인 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 카카오 로그인
  const kakaoLogin = () => {
    window.location.href = `${api.defaults.baseURL}/api/auth/kakao`;
  };
  
  // 사용자 프로필 업데이트
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put('/api/users/profile', userData);
      // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
      
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return true;
      } else {
        setError(response.data.message || '프로필 업데이트에 실패했습니다.');
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('프로필 업데이트 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      error,
      login,
      register,
      logout,
      devLogin,
      kakaoLogin,
      updateProfile,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;