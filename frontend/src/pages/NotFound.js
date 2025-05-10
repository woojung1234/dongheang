import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <FaExclamationTriangle className="not-found-icon" />
        <h1>404</h1>
        <h2>페이지를 찾을 수 없습니다</h2>
        <p>
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 일시적으로 사용할 수 없습니다.
        </p>
        <Link to="/" className="home-link">
          <FaHome />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
