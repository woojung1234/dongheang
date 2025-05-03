import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getBudgetRecommendation } from '../services/spendingService';

const BudgetRecommendation = () => {
  // 상태 관리
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [income, setIncome] = useState('');
  const [savingGoal, setSavingGoal] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  // 예산 추천 데이터 가져오기
  const fetchBudgetRecommendation = async () => {
    if (!income) {
      setError('월 소득을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getBudgetRecommendation(income, savingGoal || undefined);
      setBudgetData(response.data);
      setSubmitted(true);
      console.log('예산 추천 데이터:', response.data);
    } catch (err) {
      console.error('예산 추천 데이터 가져오기 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchBudgetRecommendation();
  };

  // 추천 예산 차트 데이터 가공
  const prepareBudgetChartData = () => {
    if (!budgetData || !budgetData.recommendedBudget) return [];
    
    return Object.entries(budgetData.recommendedBudget).map(([category, amount]) => ({
      name: categoryNames[category] || category,
      value: amount,
      percentage: Math.round((amount / budgetData.spendableAmount) * 100)
    }));
  };

  // 동년배 평균 대비 추천 예산 비교 데이터 가공
  const prepareBudgetComparisonData = () => {
    if (!budgetData || !budgetData.recommendedBudget || !budgetData.peerAverageBudget) return [];
    
    return Object.entries(budgetData.recommendedBudget).map(([category, amount]) => ({
      name: categoryNames[category] || category,
      추천예산: amount,
      동년배평균: budgetData.peerAverageBudget[category] || 0
    }));
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">맞춤형 예산 추천</h2>
      
      {/* 예산 입력 폼 */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>월 소득 (원)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="월 소득을 입력하세요"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>월 저축 목표 (원, 선택사항)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="저축 목표를 입력하세요 (선택사항)"
                    value={savingGoal}
                    onChange={(e) => setSavingGoal(e.target.value)}
                    min="0"
                  />
                  <Form.Text className="text-muted">
                    입력하지 않으면 소득의 20%로 자동 설정됩니다.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end mb-3">
                <Button type="submit" variant="primary" className="w-100">
                  예산 추천 받기
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </Spinner>
        </div>
      ) : submitted && budgetData ? (
        <>
          {/* 예산 요약 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">예산 요약</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <h6>월 소득</h6>
                  <h3 className="text-primary">{budgetData.monthlyIncome.toLocaleString()}원</h3>
                </Col>
                <Col md={3} className="mb-3">
                  <h6>저축 목표</h6>
                  <h3 className="text-success">{budgetData.monthlySavingGoal.toLocaleString()}원</h3>
                  <p className="text-muted">소득의 {Math.round((budgetData.monthlySavingGoal / budgetData.monthlyIncome) * 100)}%</p>
                </Col>
                <Col md={3} className="mb-3">
                  <h6>지출 가능 금액</h6>
                  <h3 className="text-info">{budgetData.spendableAmount.toLocaleString()}원</h3>
                  <p className="text-muted">소득의 {Math.round((budgetData.spendableAmount / budgetData.monthlyIncome) * 100)}%</p>
                </Col>
                <Col md={3} className="mb-3">
                  <h6>여유 자금</h6>
                  <h3 className="text-warning">{budgetData.remainingFunds.toLocaleString()}원</h3>
                  <p className="text-muted">소득의 {Math.round((budgetData.remainingFunds / budgetData.monthlyIncome) * 100)}%</p>
                </Col>
              </Row>
              
              {budgetData.needsAdjustment ? (
                <Alert variant="warning" className="mt-3">
                  <strong>예산 조정 필요:</strong> 소득 대비 동년배 평균 지출이 높아 예산이 조정되었습니다. 아래 추천 예산을 참고하세요.
                </Alert>
              ) : (
                <Alert variant="success" className="mt-3">
                  <strong>좋은 소식:</strong> 현재 소득으로 동년배 평균 소비 패턴을 충분히 유지할 수 있습니다.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* 추천 예산 차트 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">추천 예산 배분</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={5}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareBudgetChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {prepareBudgetChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={7}>
                  <h6 className="mb-3">카테고리별 추천 예산</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>카테고리</th>
                          <th>금액</th>
                          <th>비율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prepareBudgetChartData().map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.value.toLocaleString()}원</td>
                            <td>{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 동년배 평균 대비 추천 예산 비교 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">동년배 평균 대비 추천 예산 비교</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={prepareBudgetComparisonData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString() + '원'} />
                  <Legend />
                  <Bar dataKey="추천예산" fill="#8884d8" />
                  <Bar dataKey="동년배평균" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
              
              <Alert variant="info" className="mt-3">
                <strong>참고:</strong> 추천 예산은 동년배 평균 소비 패턴을 기반으로 하되, 현재 소득 및 저축 목표에 맞게 조정되었습니다.
              </Alert>
            </Card.Body>
          </Card>

          {/* 예산 제안 및 절약 팁 */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">예산 제안 및 절약 팁</h5>
            </Card.Header>
            <Card.Body>
              {budgetData.budgetSuggestions && budgetData.budgetSuggestions.length > 0 && (
                <>
                  <h6>예산 조정 제안</h6>
                  <ul>
                    {budgetData.budgetSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {budgetData.savingTipsForTopCategories && budgetData.savingTipsForTopCategories.length > 0 && (
                <>
                  <h6 className="mt-4">주요 카테고리 절약 팁</h6>
                  <ul>
                    {budgetData.savingTipsForTopCategories.map((tip, index) => (
                      <li key={index}>
                        <strong>{categoryNames[tip.category] || tip.category}:</strong> {tip.tip}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <h6 className="mt-4">알아두면 좋은 예산 관리 원칙</h6>
              <ul>
                <li><strong>50/30/20 원칙:</strong> 소득의 50%는 필수 지출(주거, 식비, 교통 등), 30%는 개인 욕구(여가, 취미 등), 20%는 저축 및 투자에 배분하는 것이 좋습니다.</li>
                <li><strong>비상금 마련:</strong> 3~6개월치 생활비를 비상금으로 마련해두면 갑작스러운 위기 상황에 대비할 수 있습니다.</li>
                <li><strong>지출 추적:</strong> 규칙적으로 지출을 기록하고 분석하면 불필요한 지출을 줄이는 데 도움이 됩니다.</li>
                <li><strong>자동 저축:</strong> 월급 수령 즉시 일정 금액을 자동으로 저축하는 습관을 들이면 저축 목표를 쉽게 달성할 수 있습니다.</li>
              </ul>
            </Card.Body>
          </Card>

          {/* 주의 사항 */}
          <Alert variant="secondary">
            <strong>주의:</strong> 이 예산 추천은 사용자의 소득과 동년배 평균 소비 패턴을 기반으로 생성됩니다. 개인의 상황과 필요에 따라 조정이 필요할 수 있습니다.
          </Alert>
        </>
      ) : null}
    </Container>
  );
};

export default BudgetRecommendation;
