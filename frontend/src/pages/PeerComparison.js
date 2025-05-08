import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Form, Button, Spinner } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { getComparisonStats } from '../services/spendingService';
import Layout from '../components/Layout';

const PeerComparison = () => {
  // 상태 관리
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  const [overBudgetCategories, setOverBudgetCategories] = useState([]);

  // 현재 연도와 월 설정
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  // 연령대 상태 추가
  const [ageGroup, setAgeGroup] = useState(5); // 기본값 5 (50대)
  
  // 연도 옵션 생성
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}년`
  }));

  // 연령대 옵션 추가
  const ageGroupOptions = [
    { value: 5, label: '50대' },
    { value: 6, label: '60대' },
    { value: 7, label: '70대' },
    { value: 8, label: '80대' },
    { value: 9, label: '90대' }
  ];

  // 색상 설정
  const COLORS = {
    '식비': '#FF8042',
    '교통': '#0088FE',
    '주거': '#00C49F',
    '의료': '#FFBB28',
    '문화': '#FF0000',
    '의류': '#8884D8',
    '기타': '#82CA9D'
  };

  const DEFAULT_COLORS = Object.values(COLORS);
  
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
  
  // 데이터 로딩
  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const response = await getComparisonStats(year, month, ageGroup);
      
      if (response && response.success && response.data) {
        setComparisonData(response.data);
        
        // 예산 초과 카테고리 확인 (80% 이상)
        if (Array.isArray(response.data.categoryComparison)) {
          const overBudget = response.data.categoryComparison
            .filter(item => item && item.peerAmount && item.userAmount && (item.userAmount / item.peerAmount) > 0.8)
            .map(item => ({
              category: item.category || '기타',
              percent: Math.round((item.userAmount / item.peerAmount) * 100),
              userAmount: item.userAmount || 0,
              peerAmount: item.peerAmount || 0
            }));
          
          setOverBudgetCategories(overBudget);
          setAlertShown(overBudget.length > 0);
        }
      } else {
        setError('데이터 형식이 올바르지 않습니다.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('동년배 비교 데이터 로딩 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  // 연도 선택 핸들러
  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  // 월 선택 핸들러
  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  // 연령대 선택 핸들러
  const handleAgeGroupChange = (e) => {
    setAgeGroup(parseInt(e.target.value));
  };

  // 검색 핸들러
  const handleSearch = () => {
    fetchComparisonData();
  };

  // 차트 데이터 포맷팅
  const prepareCategoryComparisonData = () => {
    if (!comparisonData || !Array.isArray(comparisonData.categoryComparison)) return [];
    
    return comparisonData.categoryComparison.map(item => ({
      category: item?.category || '기타',
      사용자: item?.userAmount || 0,
      동년배평균: item?.peerAmount || 0,
      // 비율 계산 (사용자가 평균 대비 몇 % 사용하는지)
      percent: item?.peerAmount > 0 
        ? Math.round((item.userAmount / item.peerAmount) * 100)
        : 0
    }));
  };

  // 총 지출 비교 데이터
  const prepareTotalComparisonData = () => {
    if (!comparisonData) return [];
    
    return [
      { name: '사용자', value: comparisonData?.userSpending || 0 },
      { name: '동년배평균', value: comparisonData?.peerAverage || 0 }
    ];
  };

  // 레이더 차트 데이터
  const prepareRadarData = () => {
    if (!comparisonData || !Array.isArray(comparisonData.categoryComparison)) return [];
    
    return comparisonData.categoryComparison.map(item => ({
      subject: item?.category || '기타',
      사용자: item?.userAmount > 0 ? Math.log10(item.userAmount) : 0,
      동년배평균: item?.peerAmount > 0 ? Math.log10(item.peerAmount) : 0,
      fullMark: 6
    }));
  };

  
  // 월 선택 옵션
  const monthOptions = [
    { value: 1, label: '1월' },
    { value: 2, label: '2월' },
    { value: 3, label: '3월' },
    { value: 4, label: '4월' },
    { value: 5, label: '5월' },
    { value: 6, label: '6월' },
    { value: 7, label: '7월' },
    { value: 8, label: '8월' },
    { value: 9, label: '9월' },
    { value: 10, label: '10월' },
    { value: 11, label: '11월' },
    { value: 12, label: '12월' }
  ];


  // 툴팁 사용자 지정
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      try {
        return (
          <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
            <p className="label">{`${label}`}</p>
            {payload.map((entry, index) => (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {`${entry.name}: ${safeFormat(entry.value)}원`}
              </p>
            ))}
            {payload.length > 1 && payload[0].payload?.percent && (
              <p>
                {payload[0].payload.percent > 100 
                  ? `평균 대비 ${payload[0].payload.percent - 100}% 더 지출` 
                  : `평균 대비 ${100 - payload[0].payload.percent}% 적게 지출`}
              </p>
            )}
          </div>
        );
      } catch (error) {
        console.error('툴팁 오류:', error);
        return null;
      }
      
    }
    return null;
  };

  // 소비 경고 알림 컴포넌트
  const SpendingAlertMessage = ({ categories, onClose }) => {
    if (!categories || categories.length === 0) {
      return null;
    }
  
    // 경고 메시지 생성
    const createAlertMessage = () => {
      if (categories.length === 1) {
        const category = categories[0];
        return (
          <>
            <strong>{category.category}</strong> 카테고리에서 동년배 평균의 {category.percent}%를 사용 중입니다.
            <span className="ms-2">
              (사용자: {safeFormat(category.userAmount)}원, 평균: {safeFormat(category.peerAmount)}원)
            </span>
          </>
        );
      } else {
        return (
          <>
            <p>다음 카테고리에서 동년배 평균의 80% 이상을 사용 중입니다:</p>
            <ul>
              {categories.map((category, index) => (
                <li key={index}>
                  <strong>{category.category}</strong>: 평균의 {category.percent}%
                  <span className="ms-2">
                    (사용자: {safeFormat(category.userAmount)}원, 평균: {safeFormat(category.peerAmount)}원)
                  </span>
                </li>
              ))}
            </ul>
          </>
        );
      }
    };
  
    // 경고 심각도 결정 (100% 이상이면 danger, 그 이하면 warning)
    const determineSeverity = () => {
      const highRiskCategories = categories.filter(cat => cat.percent >= 100);
      return highRiskCategories.length > 0 ? 'danger' : 'warning';
    };
  
    return (
      <Alert 
        variant={determineSeverity()} 
        dismissible 
        onClose={onClose}
        className="mb-4"
      >
        <Alert.Heading>
          {determineSeverity() === 'danger' ? '지출 주의 필요!' : '지출 경고'}
        </Alert.Heading>
        {createAlertMessage()}
        <hr />
        <p className="mb-0">
          {determineSeverity() === 'danger' 
            ? '평균을 초과하는 지출 패턴이 발견되었습니다. 지출을 줄이는 것을 고려해보세요.'
            : '동년배 평균에 근접한 지출 패턴이 발견되었습니다. 지출 추이를 모니터링하세요.'}
        </p>
      </Alert>
    );
  };

  return (
    <Layout>
      <Container className="py-4">
        <h1 className="mb-4">동년배 소비 비교</h1>
        
        {/* 경고 알림 */}
        {alertShown && overBudgetCategories.length > 0 && (
          <SpendingAlertMessage 
            categories={overBudgetCategories} 
            onClose={() => setAlertShown(false)} 
          />
        )}

        {/* 기간 선택 */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>연도</Form.Label>
                  <Form.Select value={year} onChange={handleYearChange}>
                    {yearOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>월</Form.Label>
                  <Form.Select value={month} onChange={handleMonthChange}>
                    {monthOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>연령대</Form.Label>
                  <Form.Select value={ageGroup} onChange={handleAgeGroupChange}>
                    {ageGroupOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button 
                  variant="primary" 
                  onClick={handleSearch} 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">로딩중...</span>
                    </>
                  ) : '조회하기'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        {!loading && comparisonData && (
          <>
            {/* 총 소비 비교 카드 */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">총 소비 비교</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="text-center mb-3">
                      <h4>
                        사용자: {safeFormat(comparisonData.userSpending)}원
                      </h4>
                      <h4>
                        동년배 평균: {safeFormat(comparisonData.peerAverage)}원
                      </h4>
                      {comparisonData.userSpending !== undefined && comparisonData.peerAverage !== undefined && (
                        <h5 className={Number(comparisonData.userSpending) > Number(comparisonData.peerAverage) ? 'text-danger' : 'text-success'}>
                          {Number(comparisonData.userSpending) > Number(comparisonData.peerAverage) 
                            ? `평균보다 ${safeFormat(Number(comparisonData.userSpending) - Number(comparisonData.peerAverage))}원 더 지출` 
                            : `평균보다 ${safeFormat(Number(comparisonData.peerAverage) - Number(comparisonData.userSpending))}원 적게 지출`}
                        </h5>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={prepareTotalComparisonData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareTotalComparisonData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => safeFormat(value) + '원'} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* 카테고리별 비교 차트 */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">카테고리별 소비 비교</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={prepareCategoryComparisonData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="사용자" fill="#8884d8" />
                    <Bar dataKey="동년배평균" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>

            {/* 레이더 차트 */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">카테고리별 소비 패턴</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart outerRadius={150} data={prepareRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="사용자" dataKey="사용자" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="동년배평균" dataKey="동년배평균" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />
                    
                  </RadarChart>
                </ResponsiveContainer>
                <div className="text-center mt-3">
                  <small className="text-muted">
                    * 가독성을 위해 금액에 로그 스케일이 적용되었습니다.
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* 사용자 정보 */}
            {comparisonData.userInfo && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">사용자 정보</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>연령대:</strong> {comparisonData.userInfo?.ageGroup || '-'}</p>
                  <p><strong>성별:</strong> {comparisonData.userInfo?.gender === 'male' ? '남성' : comparisonData.userInfo?.gender === 'female' ? '여성' : '-'}</p>
                  <p className="text-muted">
                    * 동년배 비교는 사용자와 같은 연령대, 같은 성별의 평균 소비 데이터를 기반으로 합니다.
                  </p>
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {loading && !error && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">로딩중...</span>
            </Spinner>
            <p className="mt-3">데이터를 불러오는 중입니다...</p>
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default PeerComparison;