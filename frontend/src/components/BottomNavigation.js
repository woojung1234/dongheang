import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaListUl, FaChartBar, FaHandHoldingHeart, FaRobot, FaUser } from 'react-icons/fa';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: <FaHome />, label: '홈' },
    { path: '/consumption', icon: <FaListUl />, label: '내역' },
    { path: '/reports', icon: <FaChartBar />, label: '분석' },
    { path: '/welfare', icon: <FaHandHoldingHeart />, label: '복지' },
    { path: '/chatbot', icon: <FaRobot />, label: '금복이' },
    { path: '/profile', icon: <FaUser />, label: '내정보' }
  ];
  
  return (
    <div className="bottom-navigation">
      {navItems.map((item) => (
        <div 
          key={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default BottomNavigation;