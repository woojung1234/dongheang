import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getComparisonStats } from '../services/spendingService';

const PeerComparison = () => {
  // 상태 관리
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // 색상 배열
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B'];
  
  // 카테고리 한글명
  const categoryNames = {
    '식비': '식비',
    '교통': '교통비',
    '주거': '주거비',
    '의료': '의료비',
    '문화': '문화/여가',
    '의류': '의류/미용',
    '기타': '기타'
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchComparisonData();
  }, [year, month]);

  // 동년배 비교 데이터 가져오기
  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getComparisonStats(year, month);
      setComparisonData(response.data);
      console.log('동년배 비교 데이터:', response.data);
    } catch (err) {
      console.error('동년배 비교 데이터 가져오기 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 비교 차트 데이터 가공
  const prepareCategoryComparisonData = () => {
    if (!comparisonData || !comparisonData.categoryComparison) return [];
    
    return comparisonData.categoryComparison.map(item => ({
      name: categoryNames[item.category] || item.category,
      나의소비: item.userAmount,
      동년배평균: item.peerAmount,
      차이: item.userAmount - item.peerAmount
    }));
  };

  // 총 소비 비교 파이 차트 데이터 가공
  const prepareTotalComparisonData = () => {
    if (!comparisonData) return [];
    
    return [
      { name: '나의 소비', value: comparisonData.userSpending },
      { name: '동년배 평균', value: comparisonData.peerAverage }
    ];
  };

  // 연도 옵션 생성
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear; y++) {
    yearOptions.push(y);
  }

  // 월 옵션 생성
  const monthOptions = [];
  for (let m = 1; m <= 12; m++) {
    monthOptions.push(m);
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">동년배 소비 비교 분석</h2>
      
      {/* 연도/월 선택 */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>연도</Form.Label>
                <Form.Select 
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>월</Form.Label>
                <Form.Select 
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : comparisonData ? (
        <>
          {/* 사용자 정보 및 요약 */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>내 정보</h5>
                  <p>연령대: {comparisonData.userInfo?.ageGroup || '정보 없음'}</p>
                  <p>성별: {comparisonData.userInfo?.gender === 'male' ? '남성' : '여성'}</p>
                </Col>
                <Col md={6}>
                  <h5>총 소비 비교</h5>
                  <p>나의 소비: {comparisonData.userSpending?.toLocaleString()}원</p>
                  <p>동년배 평균: {comparisonData.peerAverage?.toLocaleString()}원</p>
                  <p>차이: {(comparisonData.userSpending - comparisonData.peerAverage)?.toLocaleString()}원
                    ({comparisonData.userSpending > comparisonData.peerAverage ? '더 많이' : '더 적게'} 소비)</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 총 소비 비교 차트 */}
          <Card className="mb-4">
            <Card.Header>총 소비 비교</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: '나의 소비', value: comparisonData.userSpending },
                        { name: '동년배 평균', value: comparisonData.peerAverage }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                      <Legend />
                      <Bar dataKey="value" name="금액" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareTotalComparisonData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepareTotalComparisonData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 카테고리별 비교 차트 */}
          <Card className="mb-4">
            <Card.Header>카테고리별 비교</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={prepareCategoryComparisonData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                  <Legend />
                  <Bar dataKey="나의소비" fill="#8884d8" />
                  <Bar dataKey="동년배평균" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 카테고리별 차이 차트 */}
          <Card className="mb-4">
            <Card.Header>카테고리별 차이</Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={prepareCategoryComparisonData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                  <Legend />
                  <Bar dataKey="차이" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 인사이트 및 분석 */}
          <Card className="mb-4">
            <Card.Header>인사이트 및 분석</Card.Header>
            <Card.Body>
              <h5>소비 패턴 분석</h5>
              {comparisonData.userSpending > comparisonData.peerAverage ? (
                <Alert variant="warning">
                  동년배 평균보다 월 {(comparisonData.userSpending - comparisonData.peerAverage).toLocaleString()}원 더 많이 소비하고 있습니다.
                </Alert>
              ) : (
                <Alert variant="success">
                  동년배 평균보다 월 {(comparisonData.peerAverage - comparisonData.userSpending).toLocaleString()}원 더 적게 소비하고 있습니다.
                </Alert>
              )}
              
              <h5 className="mt-3">주요 차이 카테고리</h5>
              <ul className="mt-2">
                {comparisonData.categoryComparison
                  .sort((a, b) => Math.abs(b.userAmount - b.peerAmount) - Math.abs(a.userAmount - a.peerAmount))
                  .slice(0, 3)
                  .map((item, index) => (
                    <li key={index}>
                      <strong>{categoryNames[item.category] || item.category}:</strong> 동년배 대비 
                      {item.userAmount > item.peerAmount ? (
                        <span className="text-danger"> {(item.userAmount - item.peerAmount).toLocaleString()}원 더 많이</span>
                      ) : (
                        <span className="text-success"> {(item.peerAmount - item.userAmount).toLocaleString()}원 더 적게</span>
                      )} 소비
                    </li>
                  ))}
              </ul>
              
              <h5 className="mt-3">절약 가능한 카테고리</h5>
              <ul className="mt-2">
                {comparisonData.categoryComparison
                  .filter(item => item.userAmount > item.peerAmount)
                  .sort((a, b) => (b.userAmount - b.peerAmount) - (a.userAmount - a.peerAmount))
                  .slice(0, 3)
                  .map((item, index) => (
                    <li key={index}>
                      <strong>{categoryNames[item.category] || item.category}:</strong> 동년배 평균 대비 
                      <span className="text-danger"> {(item.userAmount - item.peerAmount).toLocaleString()}원</span> 절약 가능
                    </li>
                  ))}
              </ul>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Alert variant="info">데이터가 없습니다. 다른 기간을 선택해주세요.</Alert>
      )}
    </Container>
  );
};

export default PeerComparison;
