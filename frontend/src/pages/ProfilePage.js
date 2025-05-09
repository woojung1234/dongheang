import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSignOutAlt, FaCog } from 'react-icons/fa';
import Header from '../components/Header';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // 임시 사용자 데이터
  const user = {
    name: '김동행',
    age: 65,
    gender: '남성',
    email: 'kim@example.com',
    joinDate: '2023-05-15'
  };
  
  const handleLogout = () => {
    // 로그아웃 로직
    console.log('로그아웃 처리');
    navigate('/login');
  };
  
  return (
    <div className="page-container">
      <Header />
      
      <Container className="py-4">
        <div className="profile-header text-center mb-4">
          <div className="profile-avatar">
            <FaUser size={60} />
          </div>
          <h2 className="mt-3">{user.name}</h2>
          <p className="text-muted">
            {user.age}세 · {user.gender}
          </p>
        </div>
        
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>내 정보</Card.Title>
            <Row className="mb-3">
              <Col xs={4} className="text-muted">이름</Col>
              <Col xs={8}>{user.name}</Col>
            </Row>
            <Row className="mb-3">
              <Col xs={4} className="text-muted">나이</Col>
              <Col xs={8}>{user.age}세</Col>
            </Row>
            <Row className="mb-3">
              <Col xs={4} className="text-muted">성별</Col>
              <Col xs={8}>{user.gender}</Col>
            </Row>
            <Row className="mb-3">
              <Col xs={4} className="text-muted">이메일</Col>
              <Col xs={8}>{user.email}</Col>
            </Row>
            <Row>
              <Col xs={4} className="text-muted">가입일</Col>
              <Col xs={8}>{user.joinDate}</Col>
            </Row>
            <div className="mt-3 text-end">
              <Button variant="outline-primary">
                <FaEdit className="me-2" />
                정보 수정
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>설정</Card.Title>
            <div className="setting-item d-flex justify-content-between align-items-center py-2 border-bottom">
              <span>알림 설정</span>
              <FaCog />
            </div>
            <div className="setting-item d-flex justify-content-between align-items-center py-2 border-bottom">
              <span>앱 테마</span>
              <FaCog />
            </div>
            <div className="setting-item d-flex justify-content-between align-items-center py-2 border-bottom">
              <span>개인정보 처리방침</span>
              <FaCog />
            </div>
            <div className="setting-item d-flex justify-content-between align-items-center py-2">
              <span>이용약관</span>
              <FaCog />
            </div>
          </Card.Body>
        </Card>
        
        <div className="text-center mb-5">
          <Button variant="outline-danger" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            로그아웃
          </Button>
        </div>
        
        <div className="text-center text-muted small">
          <p>앱 버전: 1.0.0</p>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;