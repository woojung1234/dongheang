// frontend/src/pages/PeerComparison.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaPrint, FaInfoCircle } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AuthContext from '../context/AuthContext';
import './PeerComparison.css';

const PeerComparison = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  
  // 필터 상태
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAge, setSelectedAge] = useState(user?.age ? Math.floor(user.age / 10).toString() : '5');
  const [selectedGender, setSelectedGender] = useState(user?.gender === 'female' ? 'F' : 'M');
  
  useEffect(() => {
    if (user) {
      fetchComparisonData();
    }
  }, [selectedDate, selectedAge, selectedGender, user]);
  
  // 동년배 비교 데이터 가져오기
  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      
      // 새로운 API 엔드포인트 사용 (/api/user-spending/compare-stats)
      const response = await axios.get(`/api/user-spending/compare-stats`, {
        params: {
          userId: user._id,
          year,
          month,
          age: selectedAge
        }
      });
      
      if (!response.data.success) {
        setError('동년배 비교 데이터를 불러오는데 실패했습니다.');
        setLoading(false);
        return;
      }
      
      setComparisonData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('동년배 비교 데이터 로딩 오류:', error);
      setError('동년배 비교 데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 날짜 변경 처리
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  // 연령대 변경 처리
  const handleAgeChange = (e) => {
    setSelectedAge(e.target.value);
  };
  
  // 성별 변경 처리
  const handleGenderChange = (e) => {
    setSelectedGender(e.target.value);
  };
  
  // 리포트 인쇄
  const handlePrint = () => {
    window.print();
  };
  
  // 금액 형식화
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0';
    return new Intl.NumberFormat('ko-KR').format(amount);
  };
  
  // 카테고리별 비교 차트
  const renderCategoryComparisonChart = () => {
    if (!comparisonData || !comparisonData.categoryComparison) return null;
    
    // 데이터 가공
    const data = comparisonData.categoryComparison.map(item => ({
      name: item.category,
      내소비: item.userAmount || 0,
      동년배평균: item.peerAmount || 0
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">카테고리별 비교</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => formatCurrency(value) + '원'} />
                <Legend />
                <Bar dataKey="내소비" fill="#8884d8" />
                <Bar dataKey="동년배평균" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 레이더 차트
  const renderRadarChart = () => {
    if (!comparisonData || !comparisonData.categoryComparison) return null;
    
    // 데이터 가공 - 상대적 비율로 계산
    const maxValues = {};
    comparisonData.categoryComparison.forEach(item => {
      const max = Math.max(item.userAmount || 0, item.peerAmount || 0);
      maxValues[item.category] = max > 0 ? max : 1; // 0으로 나누기 방지
    });
    
    const data = comparisonData.categoryComparison.map(item => ({
      category: item.category,
      내소비: item.userAmount > 0 ? (item.userAmount / maxValues[item.category]) * 100 : 0,
      동년배평균: item.peerAmount > 0 ? (item.peerAmount / maxValues[item.category]) * 100 : 0,
      실제내소비: item.userAmount || 0,
      실제동년배평균: item.peerAmount || 0
    }));
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">소비 패턴 비교</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="내소비" dataKey="내소비" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                <Radar name="동년배평균" dataKey="동년배평균" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.5} />
                <Tooltip formatter={(value, name, props) => {
                  if (name === '내소비') {
                    return formatCurrency(props.payload.실제내소비) + '원';
                  } else if (name === '동년배평균') {
                    return formatCurrency(props.payload.실제동년배평균) + '원';
                  }
                  return value;
                }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 상세 비교 테이블
  const renderComparisonTable = () => {
    if (!comparisonData || !comparisonData.categoryComparison) return null;
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">카테고리별 상세 비교</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>카테고리</th>
                  <th>내 소비</th>
                  <th>동년배 평균</th>
                  <th>차이</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.categoryComparison.map((item, index) => {
                  const difference = (item.userAmount || 0) - (item.peerAmount || 0);
                  const ratio = item.peerAmount > 0 ? ((item.userAmount || 0) / item.peerAmount) * 100 : 0;
                  
                  return (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td>{formatCurrency(item.userAmount || 0)}원</td>
                      <td>{formatCurrency(item.peerAmount || 0)}원</td>
                      <td className={difference > 0 ? 'text-danger' : 'text-success'}>
                        {difference > 0 ? '+' : ''}{formatCurrency(difference)}원
                      </td>
                      <td className={ratio > 100 ? 'text-danger' : ratio < 100 ? 'text-success' : ''}>
                        {Math.round(ratio)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  // 사용자가 로그인되어 있지 않은 경우 처리
  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>로그인이 필요합니다</Alert.Heading>
          <p>
            소비 내역을 비교하려면 로그인이 필요합니다. 
            <Button 
              variant="outline-primary" 
              className="ms-2"
              onClick={() => navigate('/login')}
            >
              로그인하기
            </Button>
          </p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <div className="page-container">
      
      <Container className="py-4">
        <div className="page-header d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <button className="back-button" onClick={() => navigate('/')}>
              <FaArrowLeft />
            </button>
            <h1 className="mb-0">동년배 비교</h1>
          </div>
          
          <div>
            <Button 
              variant="outline-primary" 
              onClick={handlePrint}
            >
              <FaPrint /> 인쇄
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {/* 필터 패널 */}
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">비교 조건 설정</h5>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>월 선택</Form.Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy년 MM월"
                    showMonthYearPicker
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group>
                  <Form.Label>연령대</Form.Label>
                  <Form.Select 
                    value={selectedAge}
                    onChange={handleAgeChange}
                  >
                    <option value="5">50대</option>
                    <option value="6">60대</option>
                    <option value="7">70대</option>
                    <option value="8">80대</option>
                    <option value="9">90대</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group>
                  <Form.Label>성별</Form.Label>
                  <Form.Select 
                    value={selectedGender}
                    onChange={handleGenderChange}
                  >
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <div className="print-section">
          {/* 안내 메시지 */}
          <Alert variant="info" className="mb-4">
            <div className="d-flex align-items-center">
              <FaInfoCircle size={30} className="me-3" />
              <div>
                <h5 className="mb-1">동년배 비교란?</h5>
                <p className="mb-0">
                  귀하의 소비 패턴을 비슷한 연령대와 성별을 가진 다른 사용자들의 평균 소비와 비교하여 보여줍니다.
                  이를 통해 자신의 소비 습관을 객관적으로 파악하고 더 나은 금융 계획을 세울 수 있습니다.
                </p>
              </div>
            </div>
          </Alert>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">데이터를 불러오는 중...</p>
            </div>
          ) : comparisonData ? (
            <>
              {/* 요약 */}
              <Card className="mb-4">
                <Card.Header>
                  <h4 className="mb-0">{selectedAge*10}대 {selectedGender === 'M' ? '남성' : '여성'} 소비 비교</h4>
                </Card.Header>
                <Card.Body>
                  <Row className="text-center">
                    <Col md={4} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h6 className="text-muted">내 총 소비</h6>
                        <h2>{formatCurrency(comparisonData.summary.userTotal)}원</h2>
                      </div>
                    </Col>
                    <Col md={4} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h6 className="text-muted">동년배 평균</h6>
                        <h2>{formatCurrency(comparisonData.summary.peerAverage)}원</h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <h6 className="text-muted">차이</h6>
                        <h2 className={comparisonData.summary.difference > 0 ? 'text-danger' : 'text-success'}>
                          {comparisonData.summary.difference > 0 ? '+' : ''}
                          {formatCurrency(comparisonData.summary.difference)}원
                        </h2>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Row>
                <Col lg={6}>
                  {renderCategoryComparisonChart()}
                </Col>
                <Col lg={6}>
                  {renderRadarChart()}
                </Col>
              </Row>
              
              {renderComparisonTable()}
              
              {/* 팁 및 제안 */}
              <Card>
                <Card.Header>
                  <h5 className="mb-0">소비 개선 제안</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {comparisonData.analysis.underspendingCategories.map((item, index) => (
                      <Col md={6} key={`low-${index}`} className="mb-3">
                        <Alert variant="info" className="mb-0">
                          <h6>{item.category} 카테고리 참고 사항</h6>
                          <p className="mb-0">
                            {item.suggestion}
                          </p>
                        </Alert>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </>
          ) : (
            <Alert variant="info">
              선택한 조건에 맞는 비교 데이터가 없습니다.
            </Alert>
          )}
        </div>
      </Container>
    </div>
  );
};

export default PeerComparison;