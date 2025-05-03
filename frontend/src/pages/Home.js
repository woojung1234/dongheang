import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaHandshake, FaFileAlt, FaExchangeAlt, FaChartLine, FaCalculator } from 'react-icons/fa';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

// 컨텍스트
import AuthContext from '../context/AuthContext';

// 컴포넌트
import Chatbot from '../components/Chatbot';
import Layout from '../components/Layout';

const Home = () => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  
  // 챗봇 초기 메시지
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      content: '안녕하세요! 금복이입니다. 무엇을 도와드릴까요?',
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // 콘솔에 로그 출력
    console.log('홈 페이지 로드됨');
    console.log('인증 상태:', isAuthenticated);
    if (user) {
      console.log('사용자 정보:', user);
    }
  }, [isAuthenticated, user]);
  
  // 메시지 전송 처리
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    console.log('사용자 메시지:', message);
    
    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // 개발 환경에서는 실제 API 호출 대신 임시 응답
      console.log('챗봇 API 호출 중...');
      
      // 실제 배포 환경에서는 아래 코드 사용
      // const response = await axios.post('/api/chatbot/message', {
      //   message,
      //   sessionId: 'home-session'
      // });
      
      // 1초 후 응답 (실제 API 연동 전 테스트용)
      setTimeout(() => {
        // 봇 응답 생성 로직
        let botResponse;
        
        if (message.includes('복지') || message.includes('혜택') || message.includes('지원')) {
          botResponse = '복지 서비스에 관심이 있으시군요! 복지 서비스 메뉴에서 다양한 지원 정보를 확인하실 수 있어요. 나이, 소득 수준 등에 맞는 맞춤형 서비스도 안내해 드릴 수 있습니다.';
        } else if (message.includes('소비') || message.includes('지출') || message.includes('돈')) {
          botResponse = '소비 내역에 관한 질문이시군요. 소비 내역 메뉴에서 지출 현황을 확인하고 관리할 수 있습니다. 카테고리별 지출 분석도 제공해 드려요!';
        } else if (message.includes('예측') || message.includes('미래')) {
          botResponse = '소비 예측 기능을 확인해보세요! 과거 소비 패턴을 분석하여 미래 지출을 예측해드립니다.';
        } else if (message.includes('동년배') || message.includes('비교')) {
          botResponse = '동년배 비교 기능을 이용해보세요. 같은 나이대 사람들의 평균 소비 패턴과 비교해볼 수 있어요.';
        } else if (message.includes('예산') || message.includes('계획')) {
          botResponse = '예산 추천 기능을 통해 소득과 저축 목표에 맞는 최적의 지출 계획을 받아보세요!';
        } else if (message.includes('안녕') || message.includes('반가워') || message.includes('시작')) {
          botResponse = '안녕하세요! 반갑습니다. 저는 금융 복지 도우미 금복이입니다. 복지 서비스 정보나 소비 관리, 예산 추천에 관해 무엇이든 물어보세요!';
        } else {
          botResponse = '말씀해 주신 내용에 대해 더 자세히 알려주시면 더 정확한 도움을 드릴 수 있을 것 같아요. 복지 서비스, 소비 내역, 예산 추천 등에 대해 질문해 주세요!';
        }
        
        const botMessageObj = {
          id: Date.now(),
          content: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessageObj]);
        console.log('챗봇 응답:', botResponse);
      }, 1000);
      
    } catch (error) {
      console.error('챗봇 API 오류:', error);
      
      // 오류 메시지
      const errorMessage = {
        id: Date.now(),
        content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  // 메뉴 항목 클릭 처리
  const handleMenuClick = (route) => {
    console.log(`메뉴 클릭: ${route}`);
    navigate(route);
  };
  
  return (
    <Layout>
      <Container className="py-4">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary">금융 복지의 동반자, 동행</h1>
          <p className="lead">맞춤형 복지 서비스와 스마트한 금융 관리를 경험해보세요</p>
        </div>
        
        <Row className="mb-5">
          <Col md={8}>
            <Row xs={1} md={2} lg={3} className="g-4">
              {/* 기본 메뉴 */}
              <Col>
                <Card className="h-100 shadow-sm menu-card" onClick={() => handleMenuClick('/consumption')}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="icon-wrapper bg-primary text-white mb-3">
                      <FaWallet size={30} />
                    </div>
                    <Card.Title>소비 내역</Card.Title>
                    <Card.Text className="text-center text-muted">
                      내 소비 내역을 관리하고 분석해 보세요
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm menu-card" onClick={() => handleMenuClick('/welfare')}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="icon-wrapper bg-success text-white mb-3">
                      <FaHandshake size={30} />
                    </div>
                    <Card.Title>복지 서비스</Card.Title>
                    <Card.Text className="text-center text-muted">
                      다양한 복지 혜택 정보를 확인해 보세요
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm menu-card" onClick={() => handleMenuClick('/report')}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="icon-wrapper bg-info text-white mb-3">
                      <FaFileAlt size={30} />
                    </div>
                    <Card.Title>소비 리포트</Card.Title>
                    <Card.Text className="text-center text-muted">
                      월별 소비 패턴을 시각적으로 분석해 보세요
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              {/* 새로운 메뉴 */}
              <Col>
                <Card className="h-100 shadow-sm menu-card" onClick={() => handleMenuClick('/comparison')}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="icon-wrapper bg-warning text-white mb-3">
                      <FaExchangeAlt size={30} />
                    </div>
                    <Card.Title>동년배 비교</Card.Title>
                    <Card.Text className="text-center text-muted">
                      나와 비슷한 사람들의 소비 패턴과 비교해 보세요
                    </Card.Text>
                    <div className="ribbon">NEW</div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm menu-card" onClick={() => handleMenuClick('/prediction')}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="icon-wrapper bg-danger text-white mb-3">
                      <FaChartLine size={30} />
                    </div>
                    <Card.Title>소비 예측</Card.Title>
                    <Card.Text className="text-center text-muted">
                      미래 소비를 예측하고 준비해 보세요
                    </Card.Text>
                    <div className="ribbon">NEW</div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col>
                <Card className="h-100 shadow-sm menu-card" onClick={() => handleMenuClick('/budget')}>
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                    <div className="icon-wrapper bg-secondary text-white mb-3">
                      <FaCalculator size={30} />
                    </div>
                    <Card.Title>예산 추천</Card.Title>
                    <Card.Text className="text-center text-muted">
                      맞춤형 예산 계획을 세워 보세요
                    </Card.Text>
                    <div className="ribbon">NEW</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 chatbot-card shadow">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">금복이와 대화하기</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Chatbot 
                  messages={messages} 
                  onSendMessage={handleSendMessage} 
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col md={12}>
            <Card className="border-0 bg-light">
              <Card.Body className="text-center">
                <h4 className="mb-4">동행 앱의 새로운 기능</h4>
                <p className="lead">
                  이제 <strong>동년배 비교</strong>, <strong>소비 예측</strong>, <strong>맞춤형 예산 추천</strong> 기능까지!<br/>
                  더 스마트한 금융 관리를 경험해 보세요.
                </p>
                <hr className="my-4" />
                <p className="text-muted">
                  본 서비스는 인천광역시 소비 데이터와 공공 복지 데이터를 활용하여 개발되었습니다.<br/>
                  자세한 내용은 <a href="/about">서비스 소개</a>를 참조하세요.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Home;
