import React, { createContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import axios from 'axios';
=======
import api from '../services/api'; // axios 대신 api 서비스 사용
>>>>>>> feature

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
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
=======
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 앱 로드 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
>>>>>>> feature
        setLoading(false);
        return;
      }
      
<<<<<<< HEAD
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
=======
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
>>>>>>> feature
        setError(response.data.message || '로그인에 실패했습니다.');
        return false;
      }
    } catch (error) {
<<<<<<< HEAD
      console.error('개발용 로그인 오류:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
=======
      const errorMessage = error.response?.data?.message || '로그인 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('로그인 오류:', error);
>>>>>>> feature
      return false;
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD

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
=======
  
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
>>>>>>> feature
      {children}
    </AuthContext.Provider>
  );
};

<<<<<<< HEAD
export default AuthContext;
=======
export default AuthContext;
>>>>>>> feature
