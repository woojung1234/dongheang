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
      console.log('소비 내역 데이터 불러오는 중...');
      
      // 실제 API 호출 대신 더미 데이터 사용 (개발 단계)
      // const response = await axios.get('/api/spending', {
      //   params: { ...filters }
      // });
      
      // 더미 데이터 - CSV 파일 형식에 맞게 수정
      const dummyData = [
        {
          id: '1',
          total_spent: 15000,
          card_tpbuz_nm_1: '소매/유통',
          description: '마트 장보기',
          ta_ymd: '20250420',
          sex: 'F',
          age: 6
        },
        {
          id: '2',
          total_spent: 30000,
          card_tpbuz_nm_1: '생활서비스',
          description: '이발소',
          ta_ymd: '20250418',
          sex: 'M',
          age: 7
        },
        {
          id: '3',
          total_spent: 50000,
          card_tpbuz_nm_1: '의료/건강',
          description: '병원 진료비',
          ta_ymd: '20250415',
          sex: 'M',
          age: 8
        },
        {
          id: '4',
          total_spent: 25000,
          card_tpbuz_nm_1: '공연/전시',
          description: '영화 관람',
          ta_ymd: '20250410',
          sex: 'F',
          age: 5
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
      
      // 실제 API 호출 대신 임시 처리 (개발 단계)
      // const response = await axios.post('/api/spending', newSpending);
      
      // 임시 추가 (API 연동 전)
      const tempId = Date.now().toString();
      const newItem = {
        id: tempId,
        ...newSpending,
        total_spent: parseFloat(newSpending.total_spent)
      };
      
      setSpendings(prev => [newItem, ...prev]);
      console.log('소비 내역 추가됨:', newItem);
      
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
  
  // 날짜 포맷 변환 (YYYYMMDD → YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (dateStr.length === 8) {
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