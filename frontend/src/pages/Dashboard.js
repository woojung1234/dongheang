import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  FaChartLine, FaWallet, FaHandHoldingUsd, FaRegCalendarAlt, 
  FaChartPie, FaUsers, FaRobot, FaRegBell 
} from 'react-icons/fa';
import Header from '../components/Header';
import axios from 'axios';
import './Dashboard.css';

// 차트 컴포넌트
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6666'];

  // 대시보드 데이터 로드
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 여러 API 엔드포인트에서 데이터 병렬로 가져오기
      const [spendingResponse, budgetResponse, welfareResponse] = await Promise.all([
        axios.get('/api/spending/dashboard'),
        axios.get('/api/spending/stats/monthly'),
        axios.get('/api/welfare/peer-statistics')
      ]);
      
      // 모든 응답에서 데이터 추출 및 결합
      const combinedData = {
        spending: spendingResponse.data.success ? spendingResponse.data.data : null,
        budget: budgetResponse.data.success ? budgetResponse.data.data : null,
        welfare: welfareResponse.data.success ? welfareResponse.data.data : null,
        lastUpdated: new Date()
      };
      
      setDashboardData(combinedData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('대시보드 데이터 로딩 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 새로고침 처리
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // 소비 요약 카드
  const renderSpendingSummary = () => {
    if (!dashboardData || !dashboardData.spending) return null;

    const { totalSpending, transactionCount, topCategory } = dashboardData.spending;

    return (
      <Card className="dashboard-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaWallet className="me-2" /> 소비 요약
          </h5>
          <span className="text-muted small">
            {lastUpdated.toLocaleString()}
          </span>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="border-end">
              <div className="text-center">
                <h6 className="text-muted">총 소비 금액</h6>
                <h2 className="mb-0">{formatCurrency(totalSpending)}원</h2>
              </div>
            </Col>
            <Col md={4} className="border-end">
              <div className="text-center">
                <h6 className="text-muted">거래 건수</h6>
                <h2 className="mb-0">{transactionCount}건</h2>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h6 className="text-muted">주요 지출 카테고리</h6>
                <h4 className="mb-0">{topCategory.category}</h4>
                <span>{formatCurrency(topCategory.amount)}원</span>
              </div>
            </Col>
          </Row>
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/consumption-history')}
            >
              소비 내역 보기 &gt;
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // 월간 지출 트렌드 차트
  const renderMonthlyTrendChart = () => {
    if (!dashboardData || !dashboardData.budget) return null;

    // 월간 데이터 가공
    const data = dashboardData.budget.dailySummary.map(item => ({
      날짜: item.day,
      지출: item.total
    }));

    return (
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaChartLine className="me-2" /> 월간 지출 트렌드
          </h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="날짜" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend />
                <Area type="monotone" dataKey="지출" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/spending-report')}
            >
              상세 리포트 보기 &gt;
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // 카테고리별 지출 차트
  const renderCategoryChart = () => {
    if (!dashboardData || !dashboardData.budget) return null;

    // 카테고리 데이터 가공
    const data = dashboardData.budget.categorySummary.map((cat, index) => ({
      name: cat.category,
      value: cat.total,
      percentage: cat.percentage
    }));

    return (
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaChartPie className="me-2" /> 카테고리별 지출
          </h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/peer-comparison')}
            >
              동년배 비교 보기 &gt;
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // 예산 및 지출 요약
  const renderBudgetSummary = () => {
    if (!dashboardData || !dashboardData.spending) return null;

    // 실제 서비스에서는 이 데이터가 API에서 제공되어야 합니다
    const { totalSpending } = dashboardData.spending;
    const budget = totalSpending * 1.2; // 예시로 현재 지출보다 20% 높은 예산으로 설정
    const remaining = budget - totalSpending;
    const percentage = Math.round((totalSpending / budget) * 100);

    return (
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaHandHoldingUsd className="me-2" /> 예산 현황
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="budget-progress-container">
            <div className="budget-labels d-flex justify-content-between mb-2">
              <span>사용됨: {formatCurrency(totalSpending)}원</span>
              <span>남음: {formatCurrency(remaining)}원</span>
            </div>
            <div className="progress" style={{ height: '25px' }}>
              <div 
                className={`progress-bar ${percentage > 90 ? 'bg-danger' : percentage > 70 ? 'bg-warning' : 'bg-success'}`}
                role="progressbar" 
                style={{ width: `${percentage}%` }} 
                aria-valuenow={percentage} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {percentage}%
              </div>
            </div>
            <div className="text-end mt-2">
              <span className="text-muted">총 예산: {formatCurrency(budget)}원</span>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/budget-recommendation')}
            >
              예산 추천 받기 &gt;
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // 추천 복지 서비스
  const renderWelfareRecommendations = () => {
    // 실제 서비스에서는 이 데이터가 API에서 제공되어야 합니다
    const recommendations = [
      { id: 1, title: '노인 맞춤 돌봄 서비스', description: '일상생활 지원이 필요한 노인에게 제공되는 돌봄 서비스' },
      { id: 2, title: '어르신 교통비 지원', description: '만 65세 이상 어르신 대중교통 이용 시 교통비 할인 및 지원' },
      { id: 3, title: '노인 일자리 및 사회활동 지원', description: '노인에게 맞는 일자리와 사회참여 활동 기회 제공' }
    ];

    return (
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaUsers className="me-2" /> 추천 복지 서비스
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="welfare-recommendations">
            {recommendations.map(service => (
              <div key={service.id} className="recommendation-item mb-3">
                <h6>{service.title}</h6>
                <p className="text-muted small mb-2">{service.description}</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0"
                  onClick={() => navigate(`/welfare-services/${service.id}`)}
                >
                  자세히 보기
                </Button>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/welfare-services')}
            >
              모든 복지 서비스 보기 &gt;
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // 최근 챗봇 대화
  const renderRecentChat = () => {
    // 실제 서비스에서는 이 데이터가 API에서 제공되어야 합니다
    const recentChat = {
      id: 'chat123',
      date: '2023-08-15',
      preview: '복지 서비스 신청 방법에 대해 물어보았습니다.'
    };

    return (
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaRobot className="me-2" /> AI 금복이
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="recent-chat">
            <div className="chat-preview p-3 bg-light rounded">
              <p className="mb-2"><strong>최근 대화</strong> - {recentChat.date}</p>
              <p className="text-muted mb-0">{recentChat.preview}</p>
            </div>
            <div className="quick-questions mt-3">
              <p className="mb-2"><strong>빠른 질문하기</strong></p>
              <div className="d-flex flex-wrap gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/chatbot')}>
                  복지 서비스 추천받기
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/chatbot')}>
                  지출 관리 팁
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/chatbot')}>
                  건강 관리 방법
                </Button>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate('/chatbot')}
            >
              AI 금복이와 대화하기 &gt;
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // 알림 센터
  const renderNotifications = () => {
    // 실제 서비스에서는 이 데이터가 API에서 제공되어야 합니다
    const notifications = [
      { id: 1, type: 'budget', message: '이번 달 식비 예산의 80%를 사용했습니다.', date: '2023-08-15' },
      { id: 2, type: 'welfare', message: '새로운 노인 복지 서비스가 등록되었습니다.', date: '2023-08-14' },
      { id: 3, type: 'spending', message: '지난 달 대비 의료비 지출이 20% 증가했습니다.', date: '2023-08-13' }
    ];

    return (
      <Card className="dashboard-card">
        <Card.Header>
          <h5 className="mb-0">
            <FaRegBell className="me-2" /> 알림 센터
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification.id} className="notification-item p-2 mb-2 border-bottom">
                <div className="d-flex justify-content-between">
                  <span className={`badge bg-${notification.type === 'budget' ? 'warning' : notification.type === 'welfare' ? 'info' : 'primary'}`}>
                    {notification.type === 'budget' ? '예산' : notification.type === 'welfare' ? '복지' : '지출'}
                  </span>
                  <small className="text-muted">{notification.date}</small>
                </div>
                <p className="mb-0 mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-center mt-3">
            <Button 
              variant="outline-secondary" 
              size="sm"
            >
              모든 알림 보기
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="page-container">
      <Header />
      
      <Container className="py-4">
        <div className="page-header d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">대시보드</h1>
          <Button 
            variant="outline-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                불러오는 중...
              </>
            ) : '새로고침'}
          </Button>
        </div>
        
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">대시보드 데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* 상단 요약 섹션 */}
            <Row className="mb-4">
              <Col lg={8}>
                {renderSpendingSummary()}
              </Col>
              <Col lg={4}>
                {renderBudgetSummary()}
              </Col>
            </Row>
            
            {/* 차트 섹션 */}
            <Row className="mb-4">
              <Col lg={8}>
                {renderMonthlyTrendChart()}
              </Col>
              <Col lg={4}>
                {renderCategoryChart()}
              </Col>
            </Row>
            
            {/* 하단 섹션 */}
            <Row className="mb-4">
              <Col lg={4}>
                {renderWelfareRecommendations()}
              </Col>
              <Col lg={4}>
                {renderRecentChat()}
              </Col>
              <Col lg={4}>
                {renderNotifications()}
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;