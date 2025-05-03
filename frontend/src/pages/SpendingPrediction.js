import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getPredictionAnalysis } from '../services/spendingService';

const SpendingPrediction = () => {
  // 상태 관리
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
    fetchPredictionData();
  }, [year, month]);

  // 예측 데이터 가져오기
  const fetchPredictionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPredictionAnalysis(year, month);
      setPredictionData(response.data);
      console.log('소비 예측 데이터:', response.data);
    } catch (err) {
      console.error('소비 예측 데이터 가져오기 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 예측 월 계산
  const getPredictionMonth = () => {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return `${year}년 ${monthNames[month - 1]}`;
  };

  // 전체 카테고리 예측 데이터 가공
  const prepareAllCategoriesPredictionData = () => {
    if (!predictionData || !predictionData.categoryPredictions) return [];
    
    return Object.entries(predictionData.categoryPredictions).map(([category, data]) => ({
      name: categoryNames[category] || category,
      평균기반예측: data.averagePrediction,
      추세기반예측: data.trendPrediction
    }));
  };

  // 선택된 카테고리 과거 데이터 가공
  const prepareSelectedCategoryHistoryData = () => {
    if (!predictionData || !predictionData.categoryPredictions || selectedCategory === 'all') return [];
    
    const categoryData = predictionData.categoryPredictions[selectedCategory];
    if (!categoryData || !categoryData.pastMonthlyData) return [];
    
    const pastData = [...categoryData.pastMonthlyData];
    
    // 예측 데이터 추가
    pastData.push({
      month: `${year}-${String(month).padStart(2, '0')}`,
      amount: categoryData.averagePrediction,
      isPrediction: true,
      type: '평균기반'
    });
    
    pastData.push({
      month: `${year}-${String(month).padStart(2, '0')}`,
      amount: categoryData.trendPrediction,
      isPrediction: true,
      type: '추세기반'
    });
    
    return pastData;
  };

  // 연도 옵션 생성
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    yearOptions.push(y);
  }

  // 월 옵션 생성
  const monthOptions = [];
  for (let m = 1; m <= 12; m++) {
    monthOptions.push(m);
  }

  // 카테고리 옵션 생성
  const categoryOptions = [
    { value: 'all', label: '전체 카테고리' },
    ...Object.entries(categoryNames).map(([key, value]) => ({
      value: key,
      label: value
    }))
  ];

  return (
    <Container className="my-4">
      <h2 className="mb-4">소비 예측 분석</h2>
      
      {/* 연도/월 선택 */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
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
            <Col md={4}>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>카테고리</Form.Label>
                <Form.Select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
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
      ) : predictionData ? (
        <>
          {/* 예측 요약 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{getPredictionMonth()} 예상 소비</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>평균 기반 예측</h6>
                  <h3 className="text-primary">{predictionData.totalPrediction.averageBased.toLocaleString()}원</h3>
                  <p className="text-muted">과거 3개월 평균 소비를 기준으로 예측</p>
                </Col>
                <Col md={6}>
                  <h6>추세 기반 예측</h6>
                  <h3 className="text-success">{predictionData.totalPrediction.trendBased.toLocaleString()}원</h3>
                  <p className="text-muted">소비 증감 추세를 반영하여 예측</p>
                </Col>
              </Row>
              
              {predictionData.totalPrediction.trendBased > predictionData.totalPrediction.averageBased ? (
                <Alert variant="warning" className="mt-3">
                  소비 증가 추세가 감지되었습니다. 이번 달은 평소보다 약 {(predictionData.totalPrediction.trendBased - predictionData.totalPrediction.averageBased).toLocaleString()}원 더 지출할 것으로 예상됩니다.
                </Alert>
              ) : (
                <Alert variant="success" className="mt-3">
                  소비 감소 추세가 감지되었습니다. 이번 달은 평소보다 약 {(predictionData.totalPrediction.averageBased - predictionData.totalPrediction.trendBased).toLocaleString()}원 덜 지출할 것으로 예상됩니다.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* 카테고리별 예측 막대 차트 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">카테고리별 예측</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={prepareAllCategoriesPredictionData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                  <Legend />
                  <Bar dataKey="평균기반예측" fill="#8884d8" />
                  <Bar dataKey="추세기반예측" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 선택된 카테고리 상세 분석 */}
          {selectedCategory !== 'all' && predictionData.categoryPredictions[selectedCategory] && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{categoryNames[selectedCategory] || selectedCategory} 상세 분석</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <h6>평균 기반 예측</h6>
                    <h3 className="text-primary">{predictionData.categoryPredictions[selectedCategory].averagePrediction.toLocaleString()}원</h3>
                  </Col>
                  <Col md={6}>
                    <h6>추세 기반 예측</h6>
                    <h3 className="text-success">{predictionData.categoryPredictions[selectedCategory].trendPrediction.toLocaleString()}원</h3>
                  </Col>
                </Row>
                
                <h6 className="mt-4">소비 추이 및 예측</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={prepareSelectedCategoryHistoryData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}월`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [value.toLocaleString() + '원', props.payload.isPrediction ? `${props.payload.type} 예측` : '실제 소비']} 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      name="소비액" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeDasharray={(data) => data.isPrediction ? "5 5" : "0"}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                <Alert variant="info" className="mt-3">
                  <strong>분석 인사이트:</strong> 이 카테고리는 
                  {predictionData.categoryPredictions[selectedCategory].trendPrediction > predictionData.categoryPredictions[selectedCategory].averagePrediction 
                    ? '소비 증가' 
                    : '소비 감소'} 
                  추세를 보이고 있습니다. 
                  {predictionData.categoryPredictions[selectedCategory].trendPrediction > predictionData.categoryPredictions[selectedCategory].averagePrediction 
                    ? '예산 초과를 방지하기 위해 지출 계획을 세워보세요.' 
                    : '이 추세를 유지하면 이번 달에 절약할 수 있을 것으로 보입니다.'}
                </Alert>
              </Card.Body>
            </Card>
          )}

          {/* 예측 인사이트 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">예측 인사이트</h5>
            </Card.Header>
            <Card.Body>
              <h6>주요 변동 예상 카테고리</h6>
              <ul>
                {Object.entries(predictionData.categoryPredictions)
                  .sort((a, b) => Math.abs(b[1].trendPrediction - b[1].averagePrediction) - Math.abs(a[1].trendPrediction - a[1].averagePrediction))
                  .slice(0, 3)
                  .map(([category, data], index) => (
                    <li key={index}>
                      <strong>{categoryNames[category] || category}:</strong>{' '}
                      {data.trendPrediction > data.averagePrediction ? (
                        <span className="text-danger">평균 대비 {(data.trendPrediction - data.averagePrediction).toLocaleString()}원 증가 예상</span>
                      ) : (
                        <span className="text-success">평균 대비 {(data.averagePrediction - data.trendPrediction).toLocaleString()}원 감소 예상</span>
                      )}
                    </li>
                  ))}
              </ul>
              
              <h6 className="mt-4">예산 관리 팁</h6>
              <ul>
                {Object.entries(predictionData.categoryPredictions)
                  .filter(([_, data]) => data.trendPrediction > data.averagePrediction)
                  .sort((a, b) => (b[1].trendPrediction - b[1].averagePrediction) - (a[1].trendPrediction - a[1].averagePrediction))
                  .slice(0, 3)
                  .map(([category, data], index) => (
                    <li key={index}>
                      <strong>{categoryNames[category] || category}:</strong>{' '}
                      소비가 증가하는 추세입니다. {getTipForCategory(category)}
                    </li>
                  ))}
              </ul>
              
              <Alert variant="warning" className="mt-3">
                이 예측은 과거 3개월의 소비 패턴을 기반으로 합니다. 예상치 못한 지출이나 소비 패턴의 변화가 있을 수 있으니 참고용으로만 활용하세요.
              </Alert>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Alert variant="info">데이터가 없습니다. 다른 기간을 선택해주세요.</Alert>
      )}
    </Container>
  );
};

// 카테고리별 절약 팁
const getTipForCategory = (category) => {
  const tips = {
    '식비': '식사 계획을 세우고 집에서 요리하여 외식비를 줄여보세요.',
    '교통': '대중교통 이용이나 카풀을 활용해보세요.',
    '주거': '불필요한 전기 사용을 줄이고 에너지 효율을 높여보세요.',
    '의료': '정기 검진으로 큰 병을 예방하는 것이 비용 효율적입니다.',
    '문화': '무료 문화 행사나 할인 이벤트를 찾아보세요.',
    '의류': '계절이 바뀔 때 세일 기간을 활용하고 필요한 옷만 구매하세요.',
    '기타': '정기 구독 서비스나 불필요한 지출을 점검해보세요.'
  };
  
  return tips[category] || '예산 계획을 세워 지출을 관리해보세요.';
};

export default SpendingPrediction;
