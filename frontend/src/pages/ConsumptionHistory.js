import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';

// 컴포넌트
import Header from '../components/Header';
import SpendingItem from '../components/SpendingItem';

const ConsumptionHistory = () => {
  const navigate = useNavigate();
  const [spendings, setSpendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 새 소비 내역 상태
  const [newSpending, setNewSpending] = useState({
    amount: '',
    category: '식비',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '카드'
  });
  
  // 필터 상태
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // 소비 내역 불러오기
  useEffect(() => {
    fetchSpendings();
  }, []);
  
  const fetchSpendings = async () => {
    try {
      setLoading(true);
      console.log('소비 내역 데이터 불러오는 중...');
      
      // 실제 API 호출 대신 더미 데이터 사용 (개발 단계)
      // const response = await axios.get('/api/spending', {
      //   params: { ...filters }
      // });
      
      // 더미 데이터
      const dummyData = [
        {
          id: '1',
          amount: 15000,
          category: '식비',
          description: '점심식사',
          date: '2025-04-20',
          paymentMethod: '카드'
        },
        {
          id: '2',
          amount: 30000,
          category: '교통',
          description: '택시비',
          date: '2025-04-18',
          paymentMethod: '카드'
        },
        {
          id: '3',
          amount: 50000,
          category: '의료',
          description: '병원 진료비',
          date: '2025-04-15',
          paymentMethod: '현금'
        },
        {
          id: '4',
          amount: 25000,
          category: '문화',
          description: '영화 관람',
          date: '2025-04-10',
          paymentMethod: '카드'
        }
      ];
      
      // 1초 지연 (로딩 시뮬레이션)
      setTimeout(() => {
        console.log('소비 내역 데이터 로드 완료:', dummyData);
        setSpendings(dummyData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('소비 내역 데이터 로드 오류:', error);
      setError('소비 내역을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 폼 입력 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpending(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 필터 입력 변경 처리
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 소비 내역 추가 처리
  const handleAddSpending = async (e) => {
    e.preventDefault();
    
    try {
      console.log('소비 내역 추가 중...', newSpending);
      
      // 입력 검증
      if (!newSpending.amount || !newSpending.category) {
        setError('금액과 카테고리는 필수 입력사항입니다.');
        return;
      }
      
      // 실제 API 호출 대신 임시 처리 (개발 단계)
      // const response = await axios.post('/api/spending', newSpending);
      
      // 임시 추가 (API 연동 전)
      const tempId = Date.now().toString();
      const newItem = {
        id: tempId,
        ...newSpending,
        amount: parseFloat(newSpending.amount)
      };
      
      setSpendings(prev => [newItem, ...prev]);
      console.log('소비 내역 추가됨:', newItem);
      
      // 폼 초기화
      setNewSpending({
        amount: '',
        category: '식비',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '카드'
      });
      
      // 폼 닫기
      setShowAddForm(false);
      setError(null);
      
    } catch (error) {
      console.error('소비 내역 추가 오류:', error);
      setError('소비 내역 추가 중 오류가 발생했습니다.');
    }
  };
  
  // 필터 적용 처리
  const handleApplyFilters = () => {
    console.log('필터 적용:', filters);
    fetchSpendings();
    setShowFilters(false);
  };
  
  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      minAmount: '',
      maxAmount: ''
    });
  };
  
  // 소비 내역 삭제 처리
  const handleDeleteSpending = async (id) => {
    try {
      console.log('소비 내역 삭제 중...', id);
      
      // 실제 API 호출 대신 임시 처리 (개발 단계)
      // await axios.delete(`/api/spending/${id}`);
      
      // 임시 삭제 처리
      setSpendings(prev => prev.filter(item => item.id !== id));
      console.log('소비 내역 삭제됨:', id);
      
    } catch (error) {
      console.error('소비 내역 삭제 오류:', error);
      setError('소비 내역 삭제 중 오류가 발생했습니다.');
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
          <h1>소비 내역</h1>
          <div className="header-actions">
            <button 
              className="icon-button" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
            </button>
            <button 
              className="icon-button" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus />
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 필터 폼 */}
        {showFilters && (
          <div className="filter-form card">
            <h3>소비 내역 필터</h3>
            <div className="form-group">
              <label>시작일</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>종료일</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>카테고리</label>
              <select 
                name="category" 
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">전체</option>
                <option value="식비">식비</option>
                <option value="교통">교통</option>
                <option value="주거">주거</option>
                <option value="의료">의료</option>
                <option value="교육">교육</option>
                <option value="문화">문화</option>
                <option value="의류">의류</option>
                <option value="통신">통신</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="form-group">
              <label>최소 금액</label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>최대 금액</label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="100,000"
              />
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary" 
                onClick={handleResetFilters}
              >
                초기화
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleApplyFilters}
              >
                적용하기
              </button>
            </div>
          </div>
        )}
        
        {/* 추가 폼 */}
        {showAddForm && (
          <div className="add-form card">
            <h3>소비 내역 추가</h3>
            <form onSubmit={handleAddSpending}>
              <div className="form-group">
                <label>금액 *</label>
                <input
                  type="number"
                  name="amount"
                  value={newSpending.amount}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>카테고리 *</label>
                <select 
                  name="category" 
                  value={newSpending.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="식비">식비</option>
                  <option value="교통">교통</option>
                  <option value="주거">주거</option>
                  <option value="의료">의료</option>
                  <option value="교육">교육</option>
                  <option value="문화">문화</option>
                  <option value="의류">의류</option>
                  <option value="통신">통신</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className="form-group">
                <label>설명</label>
                <input
                  type="text"
                  name="description"
                  value={newSpending.description}
                  onChange={handleInputChange}
                  placeholder="내용을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>날짜</label>
                <input
                  type="date"
                  name="date"
                  value={newSpending.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>결제 방법</label>
                <select 
                  name="paymentMethod" 
                  value={newSpending.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="카드">카드</option>
                  <option value="현금">현금</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="모바일결제">모바일결제</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddForm(false)}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  추가하기
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* 소비 내역 목록 */}
        <div className="spending-list">
          {loading ? (
            <div className="loading">소비 내역을 불러오는 중...</div>
          ) : spendings.length > 0 ? (
            spendings.map(spending => (
              <SpendingItem 
                key={spending.id} 
                spending={spending}
                onDelete={handleDeleteSpending}
              />
            ))
          ) : (
            <div className="no-data">
              등록된 소비 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumptionHistory;
