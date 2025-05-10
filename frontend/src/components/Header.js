import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaSeedling } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    // 로그아웃 후 로그인 페이지로 리다이렉트
    navigate('/login');
  };
  
  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <FaSeedling className="logo-icon" />
          <h1>동행</h1>
        </div>
        
        {isAuthenticated ? (
          <div className="user-menu">
            <span className="user-name" onClick={() => navigate('/profile')}>
              <FaUser className="icon" /> {user?.name || '사용자'}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="icon" /> 로그아웃
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            로그인
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;