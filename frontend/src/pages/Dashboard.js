import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Badge } from 'react-bootstrap';
import { 
  FaWallet, FaChartPie, FaUsers, FaRobot, FaRegBell, 
  FaUtensils, FaShoppingBag, FaBus, FaHospital, FaMusic
} from 'react-icons/fa';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [welfareServices, setWelfareServices] = useState([]);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('홍길동'); // 기본 사용자 이름
  
  // 대시보드 데이터 로드
  useEffect(() => {
    fetchDashboardData();
    fetchWelfareServices();
    fetchUserProfile();
  }, []);
  
  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async () => {
    try {
      // 로그인 상태 확인 및 사용자 정보 가져오기
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.data) {
          setUserName(response.data.data.name || '사용자');
        }
      }
    } catch (error) {
      console.log('사용자 정보 가져오기 실패:', error);
      // 오류가 발생해도 기본 이름 유지
    }
  };
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 여러 API 엔드포인트에서 데이터 병렬로 가져오기
      const [spendingResponse, monthlyStatsResponse] = await Promise.all([
        axios.get('/api/spending/dashboard'),
        axios.get('/api/spending/stats/monthly', {
          params: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1
          }
        })
      ]);
      
      // 모든 응답에서 데이터 추출 및 결합
      const combinedData = {
        spending: spendingResponse.data.success ? spendingResponse.data.data : null,
        monthlyStats: monthlyStatsResponse.data.success ? monthlyStatsResponse.data.data : null
      };
      
      setDashboardData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('대시보드 데이터 로딩 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 더미 데이터 설정
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      setDashboardData({
        spending: {
          totalSpending: 485000,
          budget: 650000,
          transactionCount: 15,
          topCategory: { category: '식비', amount: 125000 }
        },
        monthlyStats: {
          year: currentYear,
          month: currentMonth,
          totalSpending: 485000,
          categorySummary: [
            { category: '식비', total: 125000, percentage: 25.8 },
            { category: '쇼핑', total: 98000, percentage: 20.2 },
            { category: '교통', total: 72000, percentage: 14.8 },
            { category: '의료', total: 118000, percentage: 24.3 },
            { category: '문화', total: 72000, percentage: 14.8 }
          ]
        }
      });
      setLoading(false);
    }
  };
  
  // 복지 서비스 데이터 가져오기
  const fetchWelfareServices = async () => {
    try {
      const response = await axios.get('/api/welfare');
      
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        // 실제 API 응답 사용
        setWelfareServices(response.data.data.slice(0, 3));
      } else {
        // 더미 데이터 사용
        setWelfareServices([
          { 
            id: '1', 
            서비스명: '노인 맞춤 돌봄 서비스', 
            badge: 'NEW', 
            서비스요약: '만 65세 이상 일상생활 영위가 어려운 취약노인에게 제공',
            summary: '최대 월 58만원',
            title: '노인 맞춤 돌봄 서비스'
          },
          { 
            id: '2', 
            서비스명: '어르신 교통비 지원', 
            badge: '인기', 
            서비스요약: '만 65세 이상 어르신에게 교통비 지원',
            summary: '100% 할인',
            title: '어르신 교통비 지원'
          },
          { 
            id: '3', 
            서비스명: '기초연금', 
            badge: '', 
            서비스요약: '만 65세 이상 어르신의 안정된 노후생활 지원',
            summary: '최대 월 30만원',
            title: '기초연금'
          }
        ]);
      }
    } catch (error) {
      console.error('복지 서비스 로딩 오류:', error);
      // 오류 발생 시 하드코딩된 데이터 사용
      setWelfareServices([
        { 
          id: '1', 
          서비스명: '노인 맞춤 돌봄 서비스', 
          badge: 'NEW', 
          서비스요약: '만 65세 이상 일상생활 영위가 어려운 취약노인에게 제공',
          summary: '최대 월 58만원',
          title: '노인 맞춤 돌봄 서비스'
        },
        { 
          id: '2', 
          서비스명: '어르신 교통비 지원', 
          badge: '인기', 
          서비스요약: '만 65세 이상 어르신에게 교통비 지원',
          summary: '100% 할인',
          title: '어르신 교통비 지원'
        },
        { 
          id: '3', 
          서비스명: '기초연금', 
          badge: '', 
          서비스요약: '만 65세 이상 어르신의 안정된 노후생활 지원',
          summary: '최대 월 30만원',
          title: '기초연금'
        }
      ]);
    }
  };
  
  // 금액 포맷팅
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };
  
  // 카테고리 데이터
  const categories = [
    { id: 1, name: "식비", icon: <FaUtensils />, color: "#FF6A3D" },
    { id: 2, name: "쇼핑", icon: <FaShoppingBag />, color: "#5CB8E4" },
    { id: 3, name: "교통", icon: <FaBus />, color: "#97DB4F" },
    { id: 4, name: "의료", icon: <FaHospital />, color: "#FF82A9" },
    { id: 5, name: "문화", icon: <FaMusic />, color: "#9376E0" }
  ];
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>로딩 중...</p>
      </div>
    );
  }
  
  // 사용된 예산 비율 계산 (예외 처리 강화)
  const getBudgetPercentage = () => {
    if (!dashboardData || !dashboardData.spending) return 0;
    
    const { totalSpending, budget } = dashboardData.spending;
    
    // budget이 없거나 0인 경우에 대한 예외 처리
    if (!budget || budget === 0) return 0;
    
    const spending = totalSpending || 0;
    return Math.min(Math.round((spending / budget) * 100), 100);
  };
  
  // 남은 금액 계산 (예외 처리 강화)
  const getRemainingAmount = () => {
    if (!dashboardData || !dashboardData.spending) return 0;
    
    const { totalSpending, budget } = dashboardData.spending;
    
    // budget이나 totalSpending이 없는 경우에 대한 예외 처리
    const budgetAmount = budget || 0;
    const spendingAmount = totalSpending || 0;
    
    return Math.max(budgetAmount - spendingAmount, 0);
  };
  
  // 복지 서비스 배지 렌더링
  const renderBadge = (badge) => {
    if (!badge) return null;
    
    const bgColor = badge.toLowerCase() === 'new' ? 'success' : 'warning';
    return (
      <Badge bg={bgColor} className="me-2">{badge}</Badge>
    );
  };
  
  return (
    <div className="page-container">
      {/* 상단 헤더 */}
      <div className="dashboard-header">
        <div className="user-greeting">
          <h2>안녕하세요, {userName}님!</h2>
          <p>오늘도 현명한 소비하세요!</p>
        </div>
        <div className="header-actions">
          <div className="notification-bell" onClick={() => navigate('/notifications')}>
            <FaRegBell />
            <span className="notification-dot"></span>
          </div>
        </div>
      </div>
      
      {/* 예산 카드 */}
      <div className="budget-card" onClick={() => navigate('/consumption')}>
        <div className="budget-info">
          <div className="budget-title">이번 달 예산</div>
          <div className="budget-amount">
            {formatCurrency(dashboardData.spending?.budget || 0)}원
          </div>
          <div className="budget-spent">
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ 
                  width: `${getBudgetPercentage()}%`,
                  backgroundColor: getBudgetPercentage() > 80 ? '#FF5C5C' : '#4CAF50'
                }}
              ></div>
            </div>
            <div className="progress-text">
              {getBudgetPercentage()}% 사용 · 남은 금액: {formatCurrency(getRemainingAmount())}원
            </div>
          </div>
        </div>
      </div>
      
      {/* 퀵 액션 버튼 */}
      <div className="quick-actions">
        <div className="action-button" onClick={() => navigate('/consumption')}>
          <FaWallet />
          <span>소비내역</span>
        </div>
        <div className="action-button" onClick={() => navigate('/reports')}>
          <FaChartPie />
          <span>리포트</span>
        </div>
        <div className="action-button" onClick={() => navigate('/peer-comparison')}>
          <FaUsers />
          <span>동년배 비교</span>
        </div>
        <div className="action-button" onClick={() => navigate('/chatbot')}>
          <FaRobot />
          <span>금복이</span>
        </div>
      </div>
      
      {/* 카테고리별 소비 섹션 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>카테고리별 소비</h3>
          <span className="view-all" onClick={() => navigate('/reports')}>전체보기</span>
        </div>
        <div className="categories-container">
          {dashboardData.monthlyStats && dashboardData.monthlyStats.categorySummary && 
           dashboardData.monthlyStats.categorySummary.length > 0 ? (
            // API에서 가져온 카테고리 정보 사용
            dashboardData.monthlyStats.categorySummary.map((category, index) => {
              const categoryInfo = categories.find(c => c.name === category.category) || categories[index % categories.length];
              return (
                <div 
                  key={index} 
                  className="category-item"
                  onClick={() => navigate('/reports')}
                  style={{ backgroundColor: `${categoryInfo.color}15` }}
                >
                  <div className="category-icon" style={{ color: categoryInfo.color }}>
                    {categoryInfo.icon}
                  </div>
                  <div className="category-name">{category.category}</div>
                  <div className="category-amount">{formatCurrency(category.total)}원</div>
                </div>
              );
            })
          ) : (
            // 기본 카테고리 표시
            categories.map(category => (
              <div 
                key={category.id} 
                className="category-item"
                onClick={() => navigate('/reports')}
                style={{ backgroundColor: `${category.color}15` }}
              >
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <div className="category-name">{category.name}</div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* 복지 서비스 추천 */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>맞춤 복지 서비스</h3>
          <span className="view-all" onClick={() => navigate('/welfare')}>전체보기</span>
        </div>
        <div className="welfare-cards">
          {welfareServices.map((service, index) => (
            <div 
              key={service.id || index}
              className="welfare-card"
              onClick={() => navigate(`/welfare-services/${service.id}`)}
            >
              <div className="welfare-card-content">
                <div className="welfare-title">
                  {renderBadge(service.badge)}
                  {service.서비스명 || service.title}
                </div>
                <div className="welfare-summary">{service.서비스요약 || ''}</div>
                <div className="welfare-discount">{service.summary || ''}</div>
              </div>
              <div className="welfare-arrow">›</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI 챗봇 배너 */}
      <div className="chatbot-banner" onClick={() => navigate('/chatbot')}>
        <div className="chatbot-icon">
          <FaRobot />
        </div>
        <div className="chatbot-content">
          <h4>AI 금복이와 대화하기</h4>
          <p>복지 서비스나 재정 관리에 대해 물어보세요!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;