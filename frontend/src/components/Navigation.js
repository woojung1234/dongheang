import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaHome, FaListUl, FaHandHoldingHeart, FaChartBar, FaExchangeAlt, FaChartLine, FaCalculator, FaSeedling } from 'react-icons/fa';

// 컨텍스트
import AuthContext from '../context/AuthContext';

const Navigation = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  // 현재 경로 확인
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <Navbar expand="lg" className="grass-navigation mb-4" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
          <FaSeedling className="me-2 leaf-animation" />
          <span className="brand-text">동행</span> <span className="brand-subtitle ms-2">금융 복지 도우미</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')} className="nav-link-grass">
              <FaHome className="me-1" /> 홈
            </Nav.Link>
            
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/consumption" active={isActive('/consumption')} className="nav-link-grass">
                  <FaListUl className="me-1" /> 소비 내역
                </Nav.Link>
                
                <Nav.Link as={Link} to="/report" active={isActive('/report')} className="nav-link-grass">
                  <FaChartBar className="me-1" /> 소비 리포트
                </Nav.Link>
                
                <Nav.Link as={Link} to="/comparison" active={isActive('/comparison')} className="nav-link-grass">
                  <FaExchangeAlt className="me-1" /> 동년배 비교
                </Nav.Link>
                
                <Nav.Link as={Link} to="/prediction" active={isActive('/prediction')} className="nav-link-grass">
                  <FaChartLine className="me-1" /> 소비 예측
                </Nav.Link>
                
                <Nav.Link as={Link} to="/budget" active={isActive('/budget')} className="nav-link-grass">
                  <FaCalculator className="me-1" /> 예산 추천
                </Nav.Link>
              </>
            )}
            
            <Nav.Link as={Link} to="/welfare" active={isActive('/welfare')} className="nav-link-grass">
              <FaHandHoldingHeart className="me-1" /> 복지 서비스
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;