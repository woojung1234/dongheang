import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';

// 컴포넌트
import Header from '../components/Header';
import SpendingItem from '../components/SpendingItem';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:5000'; // 백엔드 서버 주소로 변경하세요

const ConsumptionHistory = () => {
  const navigate = useNavigate();
  const [spendings, setSpendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 새 소비 내역 상태
  const [newSpending, setNewSpending] = useState({
    total_spent: '',
    card_tpbuz_nm_1: '소매/유통',
    description: '',
    ta_ymd: new Date().toISOString().split('T')[0].replace(/-/g, ''),
    sex: 'M',
    age: 5
  });
  
  // 필터 상태
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    card_tpbuz_nm_1: '',
    minAmount: '',
    maxAmount: '',
    age: '',
    sex: ''
  });
  
  // 소비 내역 불러오기
  useEffect(() => {
    fetchSpendings();
  }, []);
  
  const fetchSpendings = async () => {
    try {
      setLoading(true);
      console.log('소비 내역 데이터 불러오는 중...', filters);
      
      // 실제 API 호출
      const response = await axios.get(`${API_BASE_URL}/api/spending`, {
        params: { ...filters }
      });
      
      console.log('API 응답 데이터:', response.data);
      setSpendings(response.data);
      setLoading(false);
      
    } catch (error) {
      console.error('소비 내역 데이터 로드 오류:', error);
      setError('소비 내역을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      
      // 에러 발생 시에도 UI를 표시하기 위한 빈 배열 설정
      setSpendings([]);
    }
  };
  
  // 폼 입력 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 날짜 포맷 변환 (YYYY-MM-DD → YYYYMMDD)
    if (name === 'ta_ymd_formatted') {
      const formattedDate = value.replace(/-/g, '');
      setNewSpending(prev => ({
        ...prev,
        ta_ymd: formattedDate
      }));
      return;
    }
    
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
      if (!newSpending.total_spent || !newSpending.card_tpbuz_nm_1) {
        setError('금액과 카테고리는 필수 입력사항입니다.');
        return;
      }
      
      // 실제 API 호출
      const response = await axios.post(`${API_BASE_URL}/api/spending`, newSpending);
      
      console.log('소비 내역 추가 응답:', response.data);
      
      // 목록 업데이트
      await fetchSpendings();
      
      // 폼 초기화
      setNewSpending({
        total_spent: '',
        card_tpbuz_nm_1: '소매/유통',
        description: '',
        ta_ymd: new Date().toISOString().split('T')[0].replace(/-/g, ''),
        sex: 'M',
        age: 5
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
      card_tpbuz_nm_1: '',
      minAmount: '',
      maxAmount: '',
      age: '',
      sex: ''
    });
  };
  
  // 소비 내역 삭제 처리
  const handleDeleteSpending = async (id) => {
    try {
      console.log('소비 내역 삭제 중...', id);
      
      // 실제 API 호출
      await axios.delete(`${API_BASE_URL}/api/spending/${id}`);
      
      console.log('소비 내역 삭제됨:', id);
      
      // 목록 다시 불러오기
      await fetchSpendings();
      
    } catch (error) {
      console.error('소비 내역 삭제 오류:', error);
      setError('소비 내역 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 날짜 포맷 변환 (YYYYMMDD → YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (dateStr && dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    }
    return dateStr;
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
                name="card_tpbuz_nm_1" 
                value={filters.card_tpbuz_nm_1}
                onChange={handleFilterChange}
              >
                <option value="">전체</option>
                <option value="소매/유통">소매/유통</option>
                <option value="생활서비스">생활서비스</option>
                <option value="여가/오락">여가/오락</option>
                <option value="음식">음식</option>
                <option value="학문/교육">학문/교육</option>
                <option value="의료/건강">의료/건강</option>
                <option value="공연/전시">공연/전시</option>
                <option value="공공/기업/단체">공공/기업/단체</option>
                <option value="미디어/통신">미디어/통신</option>
              </select>
            </div>
            <div className="form-group">
              <label>연령대</label>
              <select 
                name="age" 
                value={filters.age}
                onChange={handleFilterChange}
              >
                <option value="">전체</option>
                <option value="5">50대</option>
                <option value="6">60대</option>
                <option value="7">70대</option>
                <option value="8">80대</option>
                <option value="9">90대</option>
              </select>
            </div>
            <div className="form-group">
              <label>성별</label>
              <select 
                name="sex" 
                value={filters.sex}
                onChange={handleFilterChange}
              >
                <option value="">전체</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
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
                placeholder="1,000,000"
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
                  name="total_spent"
                  value={newSpending.total_spent}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>카테고리 *</label>
                <select 
                  name="card_tpbuz_nm_1" 
                  value={newSpending.card_tpbuz_nm_1}
                  onChange={handleInputChange}
                  required
                >
                  <option value="소매/유통">소매/유통</option>
                  <option value="생활서비스">생활서비스</option>
                  <option value="여가/오락">여가/오락</option>
                  <option value="음식">음식</option>
                  <option value="학문/교육">학문/교육</option>
                  <option value="의료/건강">의료/건강</option>
                  <option value="공연/전시">공연/전시</option>
                  <option value="공공/기업/단체">공공/기업/단체</option>
                  <option value="미디어/통신">미디어/통신</option>
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
                  name="ta_ymd_formatted"
                  value={formatDateForInput(newSpending.ta_ymd)}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>성별</label>
                <select
                  name="sex"
                  value={newSpending.sex}
                  onChange={handleInputChange}
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <div className="form-group">
                <label>연령대</label>
                <select
                  name="age"
                  value={newSpending.age}
                  onChange={handleInputChange}
                >
                  <option value="5">50대</option>
                  <option value="6">60대</option>
                  <option value="7">70대</option>
                  <option value="8">80대</option>
                  <option value="9">90대</option>
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