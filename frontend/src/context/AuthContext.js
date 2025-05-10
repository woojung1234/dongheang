import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

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
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('회원가입 오류:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // 로그아웃 - 개선된 버전
  const logout = async () => {
    setLoading(true);
    try {
      // 백엔드에 로그아웃 요청 (선택적)
      if (isAuthenticated) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      // 로컬 저장소 토큰 제거
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 상태 초기화
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      // 콘솔에 로그
      console.log('로그아웃 완료: 모든 인증 정보가 삭제되었습니다.');
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
  
  // 사용자 프로필 업데이트
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put('/api/users/profile', userData);
      
      if (response.data.success) {
        // 사용자 정보 업데이트
        const updatedUser = response.data.data;
        setUser(updatedUser);
        
        // 로컬 스토리지 사용자 정보 업데이트
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      } else {
        setError(response.data.message || '프로필 업데이트에 실패했습니다.');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('프로필 업데이트 오류:', error);
      return { success: false, error: errorMessage };
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
      updateProfile,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;