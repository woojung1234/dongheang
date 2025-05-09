// frontend/src/pages/SpendingReport.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaArrowLeft, FaPrint, FaDownload, FaChartPie, FaChartBar, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import './SpendingReport.css';

const SpendingReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [genderStats, setGenderStats] = useState(null);
  const [ageStats, setAgeStats] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly');
  
  // 날짜 필터
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 컬러 팔레트
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6666', '#82ca9d', '#8dd1e1', '#a4de6c', '#d0ed57'];
  
  useEffect(() => {
    fetchMonthlyStats();
  }, [selectedDate]);
  
  useEffect(() => {
    if (activeTab === 'category' && !categoryStats) {
      fetchCategoryStats();
    } else if (activeTab === 'gender' && !genderStats) {
      fetchGenderStats();
    } else if (activeTab === 'age' && !ageStats) {
      fetchAgeStats();
    }
  }, [activeTab, categoryStats, genderStats, ageStats]);
  
  // 월별 통계 가져오기
  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      
      const response = await axios.get(`/api/spending/stats/monthly`, {
        params: { year, month }
      });
      
      if (response.data.success) {
        setMonthlyStats(response.data.data);
      } else {
        setError('월별 통계를 불러오는데 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('월별 통계 로딩 오류:', error);
      setError('월별 통계를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 카테고리별 통계 가져오기
  const fetchCategoryStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/spending/stats/category');
      
      if (response.data.success) {
        setCategoryStats(response.data.data);
      } else {
        setError('카테고리별 통계를 불러오는데 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('카테고리별 통계 로딩 오류:', error);
      setError('카테고리별 통계를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 성별 통계 가져오기
  const fetchGenderStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/spending/stats/gender');
      
      if (response.data.success) {
        setGenderStats(response.data.data);
      } else {
        setError('성별 통계를 불러오는데 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('성별 통계 로딩 오류:', error);
      setError('성별 통계를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 연령별 통계 가져오기
  const fetchAgeStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/spending/stats/age');
      
      if (response.data.success) {
        setAgeStats(response.data.data);
      } else {
        setError('연령별 통계를 불러오는데 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('연령별 통계 로딩 오류:', error);
      setError('연령별 통계를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 날짜 변경 처리
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  // 금액 형식화
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };
  
  // 리포트 인쇄
  const handlePrint = () => {
    window.print();
  };
  
  // 리포트 이미지로 저장
  const handleSaveAsImage = () => {
    const printSection = document.querySelector('.print-section');
    if (!printSection) return;
    
    import('html2canvas').then(html2canvas => {
      html2canvas.default(printSection).then(canvas => {
        const link = document.createElement('a');
        link.download = `소비리포트_${selectedDate.getFullYear()}_${selectedDate.getMonth() + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };
  
  // 월별 카테고리 분포 차트
  const renderMonthlyCategoryChart = () => {
    if (!monthlyStats || !monthlyStats.categorySummary) return null;
    
    const data = monthlyStats.categorySummary.map((cat, index) => ({
      name: cat.category,
      value: cat.total,
      percentage: cat.percentage
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">카테고리별 지출 분포</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 일별 지출 차트
  const renderDailySpendingChart = () => {
    if (!monthlyStats || !monthlyStats.dailySummary) return null;
    
    const data = monthlyStats.dailySummary.map(item => ({
      날짜: item.day,
      지출: item.total
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">일별 지출 추이</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="날짜" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend />
                <Area type="monotone" dataKey="지출" stroke="#8884d8" fill="#8884d8" activeDot={{ r: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 카테고리별 통계 차트
  const renderCategoryStatsChart = () => {
    if (!categoryStats || !categoryStats.allCategories) return null;
    
    // 상위 5개 카테고리만 표시
    const data = categoryStats.allCategories.slice(0, 5).map(cat => ({
      name: cat.category,
      금액: cat.totalSpent,
      비율: cat.percentage
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">상위 5개 카테고리 총 지출</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend />
                <Bar dataKey="금액" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 성별 통계 차트
  const renderGenderStatsChart = () => {
    if (!genderStats || !genderStats.genderStats) return null;
    
    const data = genderStats.genderStats.map(item => ({
      name: item._id === 'M' ? '남성' : '여성',
      평균지출: Math.round(item.avgSpending),
      건수: item.count
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">성별 평균 지출</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend />
                <Bar dataKey="평균지출" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 연령별 통계 차트
  const renderAgeStatsChart = () => {
    if (!ageStats || !ageStats.ageStats) return null;
    
    const data = ageStats.ageStats.map(item => ({
      name: item.ageGroup,
      평균지출: item.avgSpent,
      총지출: item.totalSpent
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">연령대별 평균 지출</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend />
                <Bar dataKey="평균지출" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
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
          <div className="d-flex align-items-center">
            <button className="back-button" onClick={() => navigate('/')}>
              <FaArrowLeft />
            </button>
            <h1 className="mb-0">소비 리포트</h1>
          </div>
          
          <div>
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={handlePrint}
            >
              <FaPrint /> 인쇄
            </Button>
            
            <Button 
              variant="outline-primary" 
              onClick={handleSaveAsImage}
            >
              <FaDownload /> 저장
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {/* 분석 유형 선택 */}
        <Tabs
          activeKey={activeTab}
          onSelect={key => setActiveTab(key)}
          className="mb-4 report-tabs"
        >
          <Tab eventKey="monthly" title={<><FaCalendarAlt className="me-2" />월간 리포트</>} />
          <Tab eventKey="category" title={<><FaChartPie className="me-2" />카테고리 분석</>} />
          <Tab eventKey="gender" title={<><FaChartBar className="me-2" />성별 분석</>} />
          <Tab eventKey="age" title={<><FaChartLine className="me-2" />연령별 분석</>} />
        </Tabs>
        
        {activeTab === 'monthly' && (
          <>
            {/* 월 선택 */}
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">월 선택</h5>
                  <div style={{ width: '200px' }}>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy년 MM월"
                      showMonthYearPicker
                      className="form-control date-picker"
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <div className="print-section">
              {/* 월별 요약 */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">데이터를 불러오는 중...</p>
                </div>
              ) : monthlyStats ? (
                <>
                  <Card className="mb-4">
                    <Card.Header>
                      <h4 className="mb-0">{monthlyStats.year}년 {monthlyStats.month}월 소비 요약</h4>
                    </Card.Header>
                    <Card.Body>
                      <Row className="text-center">
                        <Col md={4} className="mb-3 mb-md-0">
                          <div className="stat-item">
                            <h6 className="text-muted">총 소비 금액</h6>
                            <h2>{formatCurrency(monthlyStats.totalSpending)}원</h2>
                          </div>
                        </Col>
                        <Col md={4} className="mb-3 mb-md-0">
                          <div className="stat-item">
                            <h6 className="text-muted">거래 건수</h6>
                            <h2>{monthlyStats.transactionCount}건</h2>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="stat-item">
                            <h6 className="text-muted">건당 평균 금액</h6>
                            <h2>
                              {formatCurrency(
                                Math.round(monthlyStats.totalSpending / monthlyStats.transactionCount)
                              )}원
                            </h2>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  
                  <Row>
                    <Col lg={6}>
                      {renderMonthlyCategoryChart()}
                    </Col>
                    <Col lg={6}>
                      {renderDailySpendingChart()}
                    </Col>
                  </Row>
                </>
              ) : (
                <Alert variant="info">
                  선택한 월의 소비 데이터가 없습니다.
                </Alert>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'category' && (
          <div className="print-section">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">데이터를 불러오는 중...</p>
              </div>
            ) : categoryStats ? (
              <>
                {renderCategoryStatsChart()}
                
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">카테고리별 상세 분석</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>카테고리</th>
                            <th>총 지출</th>
                            <th>거래 건수</th>
                            <th>평균 지출</th>
                            <th>비율</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryStats.allCategories.map((cat, index) => (
                            <tr key={index}>
                              <td>{cat.category}</td>
                              <td>{formatCurrency(cat.totalSpent)}원</td>
                              <td>{cat.count}건</td>
                              <td>{formatCurrency(cat.avgSpent)}원</td>
                              <td>{cat.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              </>
            ) : (
              <Alert variant="info">
                카테고리별 분석 데이터가 없습니다.
              </Alert>
            )}
          </div>
        )}
        
        {activeTab === 'gender' && (
          <div className="print-section">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">데이터를 불러오는 중...</p>
              </div>
            ) : genderStats ? (
              <>
                {renderGenderStatsChart()}
                
                // frontend/src/pages/SpendingReport.js (계속)

                <Card>
                  <Card.Header>
                    <h5 className="mb-0">성별 지출 상세 분석</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {genderStats.categoryByGender && Object.values(genderStats.categoryByGender).map((item, index) => (
                        <Col lg={6} key={index} className="mb-4">
                          <h5>{item.categoryName} 카테고리 성별 비교</h5>
                          <div style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { name: '남성', 금액: item.M?.avg || 0 },
                                { name: '여성', 금액: item.F?.avg || 0 }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                                <Legend />
                                <Bar dataKey="금액" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </>
            ) : (
              <Alert variant="info">
                성별 분석 데이터가 없습니다.
              </Alert>
            )}
          </div>
        )}
        
        {activeTab === 'age' && (
          <div className="print-section">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">데이터를 불러오는 중...</p>
              </div>
            ) : ageStats ? (
              <>
                {renderAgeStatsChart()}
                
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">연령대별 상위 지출 카테고리</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {ageStats.ageGroupCategories && ageStats.ageGroupCategories.map((ageGroup, index) => (
                        <Col lg={6} key={index} className="mb-4">
                          <h5>{ageGroup.ageGroup} 상위 지출 카테고리</h5>
                          <div style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={ageGroup.topCategories.map(cat => ({
                                name: cat.category,
                                금액: cat.avgSpent
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                                <Legend />
                                <Bar dataKey="금액" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </>
            ) : (
              <Alert variant="info">
                연령대별 분석 데이터가 없습니다.
              </Alert>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default SpendingReport;