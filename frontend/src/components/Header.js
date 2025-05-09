// frontend/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import AccessibilityControls from './AccessibilityControls';
import { FaSeedling } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <FaSeedling className="logo-icon" />
          <span className="logo-text">동행</span>
        </Link>
        
        <AccessibilityControls />
      </div>
    </header>
  );
};

export default Header;