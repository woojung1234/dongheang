import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Chatbot from '../components/Chatbot';
import { getMonthlyStats, getComparisonStats } from '../services/spendingService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const Home = () => {
  // 기존 상태 관리
  const [spendingData, setSpendingData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertVisible, setAlertVisible] = useState(true);
  
  // 챗봇 관련 상태 추가
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      content: '안녕하세요! 금복이입니다. 금융 복지에 관한 질문이 있으신가요?'
    }
  ]);
  const [chatSessionId, setChatSessionId] = useState(`session_${Date.now()}`);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  // 현재 연월 구하기
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // 색상 설정
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // 안전한 숫자 포맷팅 함수
  const safeFormat = (value) => {
    try {
      if (value === undefined || value === null) return '0';
      return Number(value).toLocaleString();
    } catch (error) {
      console.error('숫자 포맷팅 오류:', error);
      return '0';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 월별 소비 통계 데이터 가져오기
        const monthlyResponse = await getMonthlyStats(currentYear, currentMonth);
        console.log('월별 통계 응답:', monthlyResponse);
        
        if (monthlyResponse?.success && monthlyResponse?.data) {
          setMonthlyStats(monthlyResponse.data);
        }
        
        // 동년배 비교 데이터 가져오기
        const comparisonResponse = await getComparisonStats(currentYear, currentMonth);
        console.log('동년배 비교 응답:', comparisonResponse);
        
        if (comparisonResponse?.success && comparisonResponse?.data) {
          setSpendingData(comparisonResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
  
    fetchData();
  }, [currentYear, currentMonth]);

  // 챗봇 메시지 전송 함수
  const handleSendMessage = async (message) => {
    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // 로딩 메시지 표시
      const loadingMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        content: '생각 중...',
        isLoading: true
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      // API 호출
      const response = await axios.post('/api/chatbot/message', {
        message: message,
        sessionId: chatSessionId
      });
      
      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // 봇 응답 추가
      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 2,
          sender: 'bot',
          content: response.data.data.message.content
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('응답 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('챗봇 메시지 전송 오류:', error);
      
      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // 오류 메시지 표시
      const errorMessage = {
        id: Date.now() + 3,
        sender: 'bot',
        content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 소비 경고 알림 컴포넌트
  const SpendingAlert = () => {
    if (!spendingData || !Array.isArray(spendingData.categoryComparison) || !alertVisible) return null;
    
    // 평균의 80% 이상 사용 중인 카테고리 찾기
    const overBudgetCategories = spendingData.categoryComparison
      .filter(item => item && item.peerAmount && item.userAmount && (item.userAmount / item.peerAmount) > 0.8)
      .map(item => ({
        category: item.category || '기타',
        percent: Math.round((item.userAmount / item.peerAmount) * 100)
      }));
    
    if (overBudgetCategories.length === 0) return null;
    
    // 경고 심각도 결정 (100% 이상이면 danger, 그 이하면 warning)
    const hasDanger = overBudgetCategories.some(cat => cat.percent >= 100);
    const variant = hasDanger ? 'danger' : 'warning';
    
    return (
      <Alert variant={variant} className="mb-4" dismissible onClose={() => setAlertVisible(false)}>
        <Alert.Heading>{hasDanger ? '지출 주의 필요!' : '지출 경고'}</Alert.Heading>
        
        {overBudgetCategories.length === 1 ? (
          <p>
            <strong>{overBudgetCategories[0].category}</strong> 카테고리에서 
            동년배 평균의 {overBudgetCategories[0].percent}%를 사용 중입니다.
          </p>
        ) : (
          <>
            <p>다음 카테고리에서 동년배 평균의 80% 이상을 사용 중입니다:</p>
            <ul>
              {overBudgetCategories.map((category, index) => (
                <li key={index}>
                  <strong>{category.category}</strong>: 평균의 {category.percent}%
                </li>
              ))}
            </ul>
          </>
        )}
        
        <hr />
        <p className="mb-0">
          <Link to="/peer-comparison" className="alert-link">동년배 소비 비교</Link>에서 자세한 내용을 확인하세요.
        </p>
      </Alert>
    );
  };

  // 카테고리별 지출 차트 데이터 준비
  const prepareCategoryData = () => {
    if (!monthlyStats || !Array.isArray(monthlyStats.categorySummary)) return [];
    
    return monthlyStats.categorySummary.map(item => ({
      name: item?.category || '기타',
      value: item?.total || 0,
      percentage: item?.percentage || 0
    }));
  };

  // 일별 지출 차트 데이터 준비
  const prepareDailyData = () => {
    if (!monthlyStats || !Array.isArray(monthlyStats.dailySummary)) return [];
    
    return monthlyStats.dailySummary.map(item => ({
      날짜: item?.day || 0,
      지출: item?.total || 0
    }));
  };

  // 사용자 지정 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      try {
        return (
          <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
            <p className="label">{`${payload[0]?.name || '기타'}: ${safeFormat(payload[0]?.value)}원`}</p>
            <p className="percentage">{`${payload[0]?.payload?.percentage || 0}%`}</p>
          </div>
        );
      } catch (error) {
        console.error('툴팁 렌더링 오류:', error);
        return null;
      }
    }
    return null;
  };

  // 챗봇 토글 함수
  const toggleChatbot = () => {
    setIsChatbotVisible(!isChatbotVisible);
  };

  return (
    <Layout>
      <Container className="py-4">
        <h1 className="mb-4">동행 - 소비 및 복지 관리 서비스</h1>
        
        {/* 소비 경고 알림 */}
        {!loading && <SpendingAlert />}

        {/* 메인 대시보드 */}
        <Row className="mb-4">
          {/* 소비 요약 */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">월간 소비 요약</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : error ? (
                  <div className="text-danger">{error}</div>
                ) : monthlyStats ? (
                  <div>
                    <h3 className="mb-3">{monthlyStats.year || currentYear}년 {monthlyStats.month || currentMonth}월</h3>
                    <p><strong>총 지출:</strong> {safeFormat(monthlyStats.totalSpending)}원</p>
                    
                    {spendingData && spendingData.peerAverage !== undefined && (
                      <>
                        <p><strong>동년배 평균:</strong> {safeFormat(spendingData.peerAverage)}원</p>
                        {monthlyStats.totalSpending !== undefined && spendingData.peerAverage !== undefined && (
                          <p className={Number(monthlyStats.totalSpending) > Number(spendingData.peerAverage) ? 'text-danger' : 'text-success'}>
                            {Number(monthlyStats.totalSpending) > Number(spendingData.peerAverage) 
                              ? `평균보다 ${safeFormat(Number(monthlyStats.totalSpending) - Number(spendingData.peerAverage))}원 더 지출` 
                              : `평균보다 ${safeFormat(Number(spendingData.peerAverage) - Number(monthlyStats.totalSpending))}원 적게 지출`}
                          </p>
                        )}
                      </>
                    )}
                    
                    <div style={{ height: '200px' }} className="mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareCategoryData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name || '기타'}: ${percentage || 0}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareCategoryData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="text-center">
                      <Button as={Link} to="/spending-report" variant="primary" className="me-2">
                        상세 리포트
                      </Button>
                      <Button as={Link} to="/peer-comparison" variant="outline-primary">
                        동년배 비교
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p>소비 데이터가 없습니다.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* 복지 서비스 */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">추천 복지 서비스</h5>
              </Card.Header>
              <Card.Body>
                <p>현재 이용 가능한 맞춤형 복지 서비스를 확인하세요.</p>
                <Button as={Link} to="/welfare-services" variant="primary">
                  복지 서비스 보기
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 금복이 챗봇 */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">금복이와 대화하기</h5>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={toggleChatbot}
            >
              {isChatbotVisible ? '숨기기' : '보이기'}
            </Button>
          </Card.Header>
          {isChatbotVisible && (
            <Card.Body>
              <Chatbot 
                messages={messages} 
                onSendMessage={handleSendMessage} 
              />
            </Card.Body>
          )}
        </Card>

        {/* 소비 트렌드 */}
        {!loading && monthlyStats && monthlyStats.dailySummary && monthlyStats.dailySummary.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">최근 소비 트렌드</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareDailyData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="날짜" />
                    <YAxis />
                    <Tooltip formatter={(value) => [safeFormat(value) + '원', '지출']} />
                    <Legend />
                    <Bar dataKey="지출" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        )}

        <Row className="mb-4">
          {/* 예산 추천 */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">맞춤형 예산 추천</h5>
              </Card.Header>
              <Card.Body>
                <p>소득과 지출 패턴을 기반으로 적합한 예산 계획을 수립하세요.</p>
                <Button as={Link} to="/budget-recommendation" variant="primary">
                  예산 추천 받기
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* 소비 예측 */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h5 className="mb-0">소비 예측 분석</h5>
              </Card.Header>
              <Card.Body>
                <p>과거 지출 패턴을 기반으로 미래 소비를 예측해보세요.</p>
                <Button as={Link} to="/spending-prediction" variant="primary">
                  소비 예측 보기
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 퀵 메뉴 */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">빠른 메뉴</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3} sm={6} className="mb-3 text-center">
                <Link to="/consumption-history" className="btn btn-outline-primary w-100 py-3">
                  소비 내역
                </Link>
              </Col>
              <Col md={3} sm={6} className="mb-3 text-center">
                <Link to="/spending-report" className="btn btn-outline-primary w-100 py-3">
                  소비 리포트
                </Link>
              </Col>
              <Col md={3} sm={6} className="mb-3 text-center">
                <Link to="/peer-comparison" className="btn btn-outline-primary w-100 py-3">
                  동년배 비교
                </Link>
              </Col>
              <Col md={3} sm={6} className="mb-3 text-center">
                <Link to="/welfare-services" className="btn btn-outline-primary w-100 py-3">
                  복지 서비스
                </Link>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default Home;