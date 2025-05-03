import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

// 컨텍스트
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  const handleLogout = () => {
    console.log('로그아웃 시도');
    logout();
  };
  
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">동행</Link>
        
        {isAuthenticated && user ? (
          <div className="user-profile">
            <img 
              src={user.profileImage || 'https://via.placeholder.com/40'}
              alt="사용자 프로필"
              className="user-avatar"
            />
            <span className="user-name">{user.name || '사용자'}</span>
            <button 
              className="logout-button"
              onClick={handleLogout}
              title="로그아웃"
            >
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-link">
            <FaUser />
            로그인
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
