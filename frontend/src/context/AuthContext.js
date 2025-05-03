import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 로컬 스토리지에서 토큰 가져오기
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // 토큰 설정하기
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      console.log('인증 상태 확인 중...');
      const token = getToken();
      
      if (!token) {
        console.log('토큰이 없음, 인증되지 않은 상태');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // API 요청 헤더에 토큰 설정
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.get('/api/auth/check', config);
      
      if (response.data.success) {
        console.log('인증됨', response.data.user);
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        console.log('인증 실패', response.data);
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('인증 확인 오류:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      
      // 401 오류는 토큰 만료 또는 유효하지 않음을 의미
      if (error.response && error.response.status === 401) {
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError('인증 서버 연결 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 개발용 로그인 (실제 배포 환경에서는 사용 안 함)
  const devLogin = async (email) => {
    try {
      console.log('개발용 로그인 시도:', email);
      setLoading(true);
      
      const response = await axios.post('/api/auth/dev-login', { email });
      
      if (response.data.success) {
        console.log('개발용 로그인 성공', response.data);
        const { token, user } = response.data;
        
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        setError(null);
        
        return true;
      } else {
        console.log('개발용 로그인 실패', response.data);
        setError(response.data.message || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('개발용 로그인 오류:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 카카오 로그인
  const kakaoLogin = () => {
    console.log('카카오 로그인 리다이렉트...');
    window.location.href = '/api/auth/kakao';
  };

  // 로그아웃
  const logout = async () => {
    try {
      console.log('로그아웃 시도');
      const token = getToken();
      
      if (token) {
        // API 요청 헤더에 토큰 설정
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        
        await axios.post('/api/auth/logout', {}, config);
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      // 로컬 상태 정리
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log('로그아웃 완료');
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  // 오류 메시지 자동 타이머 삭제
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        devLogin,
        kakaoLogin,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
