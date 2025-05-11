// frontend/src/components/BudgetSettingModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './BudgetSettingModal.css';

const BudgetSettingModal = ({ show, onHide, userId, onSuccess }) => {
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState({
    '의류/건강': '',
    '공연/전시': '',
    '음식': ''
  });
  
  // 현재 예산 로드
  useEffect(() => {
    if (show && userId) {
      fetchCurrentBudget();
    }
  }, [show, userId]);
  
  const fetchCurrentBudget = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/budget/current?userId=${userId}`);
      
      if (response.data.success && response.data.data) {
        const budgetData = response.data.data;
        setBudget(budgetData.amount.toString());
        
        // 카테고리별 예산 설정
        const categories = {};
        if (budgetData.categories) {
          Object.entries(budgetData.categories).forEach(([key, value]) => {
            categories[key] = value.toString();
          });
          
          setCategoryBudgets(prev => ({
            ...prev,
            ...categories
          }));
        }
      }
    } catch (error) {
      console.error('예산 로드 오류:', error);
      setError('현재 예산을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!budget) {
      setError('예산 금액을 입력해주세요.');
      return;
    }
    
    // 카테고리 예산 객체 생성
    const categories = {};
    for (const [key, value] of Object.entries(categoryBudgets)) {
      if (value) {
        categories[key] = parseInt(value);
      }
    }
    
    // 현재 월과 년도
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    try {
      setLoading(true);
      const response = await axios.post('/api/budget', {
        userId,
        amount: parseInt(budget),
        month,
        year,
        categories
      });
      
      if (response.data.success) {
        onSuccess(response.data.data);
        onHide();
      }
    } catch (error) {
      console.error('예산 저장 오류:', error);
      setError('예산 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setBudget('');
    setCategoryBudgets({
      '의류/건강': '',
      '공연/전시': '',
      '음식': ''
    });
    setError('');
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>예산 설정</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">로딩 중...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <Form.Group className="mb-3">
              <Form.Label>이번 달 총 예산</Form.Label>
              <Form.Control
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="총 예산 금액"
                min="0"
              />
              <Form.Text className="text-muted">
                사용하실 이번 달 총 예산을 입력해주세요.
              </Form.Text>
            </Form.Group>
            
            <h5 className="mb-3">카테고리별 예산 (선택사항)</h5>
            
            {Object.keys(categoryBudgets).map(category => (
              <Form.Group className="mb-3" key={category}>
                <Form.Label>{category}</Form.Label>
                <Form.Control
                  type="number"
                  value={categoryBudgets[category]}
                  onChange={(e) => setCategoryBudgets(prev => ({
                    ...prev,
                    [category]: e.target.value
                  }))}
                  placeholder={`${category} 예산`}
                  min="0"
                />
              </Form.Group>
            ))}
          </Form>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          취소
        </Button>
        <Button variant="outline-secondary" onClick={handleReset}>
          초기화
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BudgetSettingModal;