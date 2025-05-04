import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

// 차트 컴포넌트
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// 헤더 컴포넌트
import Header from '../components/Header';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:5000'; // 백엔드 서버 주소로 변경하세요

const SpendingReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  
  // 날짜 선택
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  
  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      await fetchMonthlyData();
      await fetchComparisonData();
    };
    
    fetchData();
  }, [selectedYear, selectedMonth]);
  
  // 월별 소비 통계 불러오기
  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      console.log('월별 소비 통계 데이터 불러오는 중...', selectedYear, selectedMonth);
      
      // 실제 API 호출
      const response = await axios.get(`${API_BASE_URL}/api/spending/stats/monthly`, {
        params: { 
          year: selectedYear, 
          month: selectedMonth 
        }
      });
      
      console.log('API 응답 데이터:', response.data);
      setMonthlyData(response.data);
      setLoading(false);
      
    } catch (error) {
      console.error('월별 소비 통계 데이터 로드 오류:', error);
      setError('소비 통계를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      
      // 에러 발생 시에도 UI를 표시하기 위한 임시 데이터 설정
      // 실제 환경에서 필요에 따라 제거하거나 수정하세요
      setMonthlyData({
        year: selectedYear,
        month: selectedMonth,
        totalSpending: 0,
        categorySummary: [],
        dailySummary: []
      });
    }
  };
  
  // 동년배 비교 데이터 불러오기
  const fetchComparisonData = async () => {
    try {
      console.log('동년배 비교 데이터 불러오는 중...');
      
      // 실제 API 호출
      const response = await axios.get(`${API_BASE_URL}/api/spending/comparison`, {
        params: { 
          year: selectedYear, 
          month: selectedMonth 
        }
      });
      
      console.log('API 응답 데이터:', response.data);
      setComparisonData(response.data);
      
    } catch (error) {
      console.error('동년배 비교 데이터 로드 오류:', error);
      // 동년배 비교 데이터 로드 실패는 치명적이지 않으므로 메인 오류 상태에는 설정하지 않음
    }
  };
  
  // 차트 데이터 구성
  const getPieChartData = () => {
    if (!monthlyData || !monthlyData.categorySummary || monthlyData.categorySummary.length === 0) return null;
    
    const labels = monthlyData.categorySummary.map(item => item.category);
    const data = monthlyData.categorySummary.map(item => item.total);
    const backgroundColors = [
      '#FF9F40', // 소매/유통
      '#36A2EB', // 생활서비스
      '#4BC0C0', // 여가/오락
      '#FF6384', // 의료/건강
      '#FFCD56', // 음식
      '#9966FF', // 학문/교육
      '#C9CBCF', // 공연/전시
      '#6C757D'  // 미디어/통신
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }
      ]
    };
  };
  
  const getBarChartData = () => {
    if (!monthlyData || !monthlyData.dailySummary || monthlyData.dailySummary.length === 0) return null;
    
    // 주별로 그룹화
    const weeks = [[], [], [], [], []];
    monthlyData.dailySummary.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      if (weekIndex < 5) {
        weeks[weekIndex].push(day);
      }
    });
    
    // 주별 합계 계산
    const weeklyData = weeks.map((week, index) => ({
      label: `${index + 1}주차`,
      total: week.reduce((sum, day) => sum + day.total, 0)
    }));
    
    return {
      labels: weeklyData.map(week => week.label),
      datasets: [
        {
          label: '주별 지출',
          data: weeklyData.map(week => week.total),
          backgroundColor: '#FF9D3D',
          borderWidth: 1
        }
      ]
    };
  };
  
  const getComparisonChartData = () => {
    if (!comparisonData || !comparisonData.categoryComparison || comparisonData.categoryComparison.length === 0) return null;
    
    return {
      labels: comparisonData.categoryComparison.map(item => item.category),
      datasets: [
        {
          label: '나의 지출',
          data: comparisonData.categoryComparison.map(item => item.userAmount),
          backgroundColor: '#FF9D3D',
          stack: 'Stack 0'
        },
        {
          label: '동년배 평균',
          data: comparisonData.categoryComparison.map(item => item.peerAmount),
          backgroundColor: '#805B38',
          stack: 'Stack 1'
        }
      ]
    };
  };
  
  // 옵션
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw.toLocaleString() + '원';
            const percentage = monthlyData.categorySummary[context.dataIndex].percentage + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    }
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '주별 지출 현황',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw.toLocaleString() + '원';
            return value;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + '원';
          }
        }
      }
    }
  };
  
  const comparisonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '동년배 평균 비교',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw.toLocaleString() + '원';
            return `${context.dataset.label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + '원';
          }
        }
      }
    }
  };
  
  // 월 변경 처리
  const handleMonthChange = (e) => {
    const monthValue = parseInt(e.target.value);
    if (monthValue >= 1 && monthValue <= 12) {
      setSelectedMonth(monthValue);
    }
  };
  
  // 연도 변경 처리
  const handleYearChange = (e) => {
    const yearValue = parseInt(e.target.value);
    if (yearValue >= 2000 && yearValue <= 2030) {
      setSelectedYear(yearValue);
    }
  };
  
  return (
    <div className="page-container">
      <Header />
      
      <div className="page-content">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft />
          </button>
          <h1>소비 리포트</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 날짜 선택 */}
        <div className="date-selector">
          <div className="date-icon">
            <FaCalendarAlt />
          </div>
          <div className="date-inputs">
            <select 
              value={selectedYear}
              onChange={handleYearChange}
              className="year-select"
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select 
              value={selectedMonth}
              onChange={handleMonthChange}
              className="month-select"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">소비 리포트를 불러오는 중...</div>
        ) : monthlyData ? (
          <div className="report-container">
            {/* 월별 총 지출 */}
            <div className="total-spending card">
              <h2>월별 총 지출</h2>
              <div className="total-amount">
                {monthlyData.totalSpending ? monthlyData.totalSpending.toLocaleString() : 0}원
              </div>
              {comparisonData && (
                <div className="comparison-summary">
                  {comparisonData.userSpending < comparisonData.peerAverage ? (
                    <div className="good-comparison">
                      동년배 평균보다 {(comparisonData.peerAverage - comparisonData.userSpending).toLocaleString()}원 적게 지출했습니다.
                    </div>
                  ) : (
                    <div className="bad-comparison">
                      동년배 평균보다 {(comparisonData.userSpending - comparisonData.peerAverage).toLocaleString()}원 더 지출했습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 카테고리별 지출 */}
            <div className="category-spending card">
              <h2>카테고리별 지출</h2>
              <div className="chart-container">
                {getPieChartData() && (
                  <Pie data={getPieChartData()} options={pieChartOptions} />
                )}
              </div>
              <div className="category-details">
                {monthlyData.categorySummary && monthlyData.categorySummary.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-name">{category.category}</div>
                    <div className="category-amount">{category.total.toLocaleString()}원</div>
                    <div className="category-percentage">{category.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 주별 지출 추이 */}
            <div className="weekly-spending card">
              <h2>주별 지출 추이</h2>
              <div className="chart-container">
                {getBarChartData() && (
                  <Bar data={getBarChartData()} options={barChartOptions} />
                )}
              </div>
            </div>
            
            {/* 동년배 비교 */}
            {comparisonData && (
              <div className="peer-comparison card">
                <h2>동년배 평균 비교</h2>
                <div className="chart-container">
                  {getComparisonChartData() && (
                    <Bar data={getComparisonChartData()} options={comparisonChartOptions} />
                  )}
                </div>
                <div className="comparison-insight">
                  {comparisonData.categoryComparison && comparisonData.categoryComparison.length > 0 && (
                    <>
                      <h3>소비 패턴 분석</h3>
                      <p>
                        당신은 동년배보다 {comparisonData.categoryComparison[0].category}({(comparisonData.categoryComparison[0].userAmount - comparisonData.categoryComparison[0].peerAmount).toLocaleString()}원)에 더 많이 지출하고,
                        {comparisonData.categoryComparison.length > 4 ? comparisonData.categoryComparison[4].category : '다른 카테고리'}({comparisonData.categoryComparison.length > 4 ? (comparisonData.categoryComparison[4].peerAmount - comparisonData.categoryComparison[4].userAmount).toLocaleString() : 0}원)에는 덜 지출하고 있습니다.
                      </p>
                      <p>
                        전체적으로 동년배 평균보다 {comparisonData.userSpending < comparisonData.peerAverage ? '적게' : '많이'} 지출하고 있어요.
                        {comparisonData.userSpending > comparisonData.peerAverage && ' 지출 관리에 좀 더 신경 쓰면 좋을 것 같아요.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* 지출 조언 */}
            <div className="spending-advice card">
              <h2>이번 달 지출 조언</h2>
              <div className="advice-content">
                {monthlyData.categorySummary && monthlyData.categorySummary.length > 0 ? (
                  <>
                    <p>
                      {monthlyData.categorySummary[0].category}이 전체 지출의 {monthlyData.categorySummary[0].percentage}%를 차지하고 있습니다. 
                      생필품 구매 계획을 세워 불필요한 지출을 줄여보세요.
                    </p>
                    {monthlyData.categorySummary.length > 2 && (
                      <p>
                        {monthlyData.categorySummary[2].category} 비용은 전체의 {monthlyData.categorySummary[2].percentage}%를 차지합니다.
                        지역 내 무료 문화 행사나 공공시설을 활용하면 비용을 절약할 수 있습니다.
                      </p>
                    )}
                    <p>
                      다음 달 예상 지출은 약 {(monthlyData.totalSpending * 0.95).toLocaleString()}원 정도로 예상됩니다.
                      계획적인 소비로 금액을 더 줄여보세요!
                    </p>
                  </>
                ) : (
                  <p>아직 충분한 소비 데이터가 없어 조언을 제공할 수 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            소비 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingReport;