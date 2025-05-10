// frontend/src/pages/ConsumptionHistory.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Form, Row, Col, Alert, Spinner, Modal, Badge, Table } from 'react-bootstrap';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaFilter, FaSort, FaDownload } from 'react-icons/fa';
import Header from '../components/Header';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ConsumptionHistory.css';

const ConsumptionHistory = () => {
  const navigate = useNavigate();
  const [spendings, setSpendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpending, setSelectedSpending] = useState(null);
  const [sortField, setSortField] = useState('ta_ymd');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // 새 소비 내역 상태
  const [newSpending, setNewSpending] = useState({
    total_spent: '',
    card_tpbuz_nm_1: '소매/유통',
    description: '',
    ta_ymd: new Date(),
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
      setError(null);
      
      // 필터 매개변수 구성
      const params = {};
      if (filters.startDate) params.startDate = formatDateString(filters.startDate);
      if (filters.endDate) params.endDate = formatDateString(filters.endDate);
      if (filters.card_tpbuz_nm_1) params.card_tpbuz_nm_1 = filters.card_tpbuz_nm_1;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      if (filters.age) params.age = filters.age;
      if (filters.sex) params.sex = filters.sex;
      
      // 정렬 매개변수 추가
      params.sortField = sortField;
      params.sortDirection = sortDirection;
      
      const response = await axios.get('/api/spending', { params });
      
      if (response.data.success) {
        setSpendings(response.data.data);
      } else {
        setError('소비 내역을 불러오는데 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('소비 내역 로딩 오류:', error);
      setError('소비 내역을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 날짜 형식 변환 (Date -> 'YYYY-MM-DD')
  const formatDateString = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // 날짜 형식 변환 (Date -> 'YYYYMMDD')
  const formatDateForAPI = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
  };
  
  // 날짜 형식 변환 ('YYYYMMDD' -> Date)
  const parseAPIDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return new Date();
    
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    
    return new Date(year, month, day);
  };
  
  // 소비 내역 추가
  const handleAddSpending = async () => {
    try {
      setError(null);
      
      // 필수 필드 검증
      if (!newSpending.total_spent || !newSpending.card_tpbuz_nm_1) {
        setError('금액과 카테고리는 필수 입력사항입니다.');
        return;
      }
      
      // API 요청 데이터 준비
      const spendingData = {
        ...newSpending,
        ta_ymd: formatDateForAPI(newSpending.ta_ymd)
      };
      
      const response = await axios.post('/api/spending', spendingData);
      
      if (response.data.success) {
        setSuccess('소비 내역이 추가되었습니다.');
        setNewSpending({
          total_spent: '',
          card_tpbuz_nm_1: '소매/유통',
          description: '',
          ta_ymd: new Date(),
          sex: 'M',
          age: 5
        });
        setShowAddModal(false);
        fetchSpendings();
      } else {
        setError('소비 내역 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('소비 내역 추가 오류:', error);
      setError('소비 내역 추가 중 오류가 발생했습니다.');
    }
  };
  
  // 소비 내역 수정
  const handleEditSpending = async () => {
    try {
      setError(null);
      
      // 필수 필드 검증
      if (!selectedSpending.total_spent || !selectedSpending.card_tpbuz_nm_1) {
        setError('금액과 카테고리는 필수 입력사항입니다.');
        return;
      }
      
      // API 요청 데이터 준비
      const spendingData = {
        ...selectedSpending,
        ta_ymd: formatDateForAPI(selectedSpending.ta_ymd)
      };
      
      const response = await axios.put(`/api/spending/${selectedSpending._id}`, spendingData);
      
      if (response.data.success) {
        setSuccess('소비 내역이 수정되었습니다.');
        setShowEditModal(false);
        fetchSpendings();
      } else {
        setError('소비 내역 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('소비 내역 수정 오류:', error);
      setError('소비 내역 수정 중 오류가 발생했습니다.');
    }
  };
  
  // 소비 내역 삭제
  const handleDeleteSpending = async () => {
    try {
      setError(null);
      
      const response = await axios.delete(`/api/spending/${selectedSpending._id}`);
      
      if (response.data.success) {
        setSuccess('소비 내역이 삭제되었습니다.');
        setShowDeleteModal(false);
        fetchSpendings();
      } else {
        setError('소비 내역 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('소비 내역 삭제 오류:', error);
      setError('소비 내역 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 필터 적용
  const handleApplyFilters = () => {
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
  
  // 입력값 변경 처리 (새 소비 내역)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpending(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 입력값 변경 처리 (선택된 소비 내역)
  const handleSelectedInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedSpending(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 날짜 선택 처리 (새 소비 내역)
  const handleDateChange = (date) => {
    setNewSpending(prev => ({
      ...prev,
      ta_ymd: date
    }));
  };
  
  // 날짜 선택 처리 (선택된 소비 내역)
  const handleSelectedDateChange = (date) => {
    setSelectedSpending(prev => ({
      ...prev,
      ta_ymd: date
    }));
  };
  
  // 필터 입력값 변경 처리
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 필터 날짜 선택 처리
  const handleFilterDateChange = (name, date) => {
    setFilters(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // 편집 모달 열기
  const openEditModal = (spending) => {
    setSelectedSpending({
      ...spending,
      ta_ymd: parseAPIDate(spending.ta_ymd)
    });
    setShowEditModal(true);
  };
  
  // 삭제 모달 열기
  const openDeleteModal = (spending) => {
    setSelectedSpending(spending);
    setShowDeleteModal(true);
  };
  
  // 정렬 변경 처리
  const handleSortChange = (field) => {
    if (field === sortField) {
      // 같은 필드를 다시 클릭하면 정렬 방향 전환
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드를 클릭하면 해당 필드로 정렬하고 기본 내림차순 적용
      setSortField(field);
      setSortDirection('desc');
    }
    
    // 정렬 적용을 위해 데이터 다시 로드
    fetchSpendings();
  };
  
  // 소비 내역 CSV 내보내기
  const exportToCSV = () => {
    // 현재 표시된 데이터를 CSV 형식으로 변환
    let csvContent = "날짜,카테고리,금액,설명\n";
    
    spendings.forEach(spending => {
      const date = spending.ta_ymd ? 
        `${spending.ta_ymd.substring(0, 4)}-${spending.ta_ymd.substring(4, 6)}-${spending.ta_ymd.substring(6, 8)}` : '';
      const category = spending.card_tpbuz_nm_1 || '';
      const amount = spending.total_spent || 0;
      // 쉼표가 있을 경우 처리
      const description = spending.description ? `"${spending.description.replace(/"/g, '""')}"` : '';
      
      csvContent += `${date},${category},${amount},${description}\n`;
    });
    
    // CSV 파일로 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `소비내역_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 카테고리에 따른 배지 색상 결정
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case '소매/유통': return 'primary';
      case '생활서비스': return 'success';
      case '여가/오락': return 'warning';
      case '음식': return 'danger';
      case '학문/교육': return 'info';
      case '의료/건강': return 'purple'; // 사용자 정의 색상
      case '공연/전시': return 'secondary';
      case '공공/기업/단체': return 'dark';
      case '미디어/통신': return 'orange'; // 사용자 정의 색상
      default: return 'light';
    }
  };
  
  // 금액 형식화
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
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
            <h1 className="mb-0">소비 내역</h1>
          </div>
          
          <div>
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <FaFilter /> 필터
            </Button>
            
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={exportToCSV}
              disabled={spendings.length === 0}
            >
              <FaDownload /> 내보내기
            </Button>
            
            <Button 
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> 소비 추가
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}
        
        {/* 필터 패널 */}
        {showFilters && (
          <Card className="mb-4 filter-panel">
            <Card.Body>
              <h5 className="mb-3">검색 필터</h5>
              <Row className="g-3">
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>시작일</Form.Label>
                    <DatePicker
                      selected={filters.startDate}
                      onChange={(date) => handleFilterDateChange('startDate', date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                      placeholderText="시작일 선택"
                      isClearable
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>종료일</Form.Label>
                    <DatePicker
                      selected={filters.endDate}
                      onChange={(date) => handleFilterDateChange('endDate', date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                      placeholderText="종료일 선택"
                      isClearable
                      minDate={filters.startDate}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>카테고리</Form.Label>
                    <Form.Select 
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
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>연령대</Form.Label>
                    <Form.Select 
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
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>성별</Form.Label>
                    <Form.Select 
                      name="sex"
                      value={filters.sex}
                      onChange={handleFilterChange}
                    >
                      <option value="">전체</option>
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>최소 금액</Form.Label>
                    <Form.Control
                      type="number"
                      name="minAmount"
                      value={filters.minAmount}
                      onChange={handleFilterChange}
                      placeholder="0"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>최대 금액</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxAmount"
                      value={filters.maxAmount}
                      onChange={handleFilterChange}
                      placeholder="1,000,000"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6} lg={3} className="d-flex align-items-end">
                  <div className="d-flex gap-2 w-100">
                    <Button 
                      variant="secondary"
                      onClick={handleResetFilters}
                      className="flex-grow-1"
                    >
                      초기화
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={handleApplyFilters}
                      className="flex-grow-1"
                    >
                      적용
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
        
        {/* 소비 내역 테이블 */}
        <Card className="mb-4">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">소비 내역을 불러오는 중...</p>
              </div>
            ) : spendings.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="consumption-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSortChange('ta_ymd')}>
                        날짜 
                        {sortField === 'ta_ymd' && (
                          <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </th>
                      <th>카테고리</th>
                      <th className="sortable" onClick={() => handleSortChange('total_spent')}>
                        금액 
                        {sortField === 'total_spent' && (
                          <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </th>
                      <th>설명</th>
                      <th className="text-end">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendings.map(spending => (
                      <tr key={spending._id}>
                        <td>
                          {spending.ta_ymd ? (
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="me-2 text-muted" />
                              {`${spending.ta_ymd.substring(0, 4)}-${spending.ta_ymd.substring(4, 6)}-${spending.ta_ymd.substring(6, 8)}`}
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          <Badge bg={getCategoryBadgeColor(spending.card_tpbuz_nm_1)}>
                            {spending.card_tpbuz_nm_1 || '기타'}
                          </Badge>
                        </td>
                        <td className="fw-bold text-end">
                          {formatCurrency(spending.total_spent)}원
                        </td>
                        <td>{spending.description || '-'}</td>
                        <td className="text-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => openEditModal(spending)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => openDeleteModal(spending)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-3">등록된 소비 내역이 없습니다.</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus /> 소비 내역 추가하기
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
        
        {/* 소비 현황 요약 */}
        {spendings.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">소비 현황 요약</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="summary-item">
                    <h6 className="text-muted">총 소비 금액</h6>
                    <h3>
                      {formatCurrency(
                        spendings.reduce((total, spending) => total + (spending.total_spent || 0), 0)
                      )}원
                    </h3>
                  </div>
                </Col>
                <Col md={4} className="mb-3 mb-md-0">
                  <div className="summary-item">
                    <h6 className="text-muted">평균 소비 금액</h6>
                    <h3>
                      {formatCurrency(
                        Math.round(
                          spendings.reduce((total, spending) => total + (spending.total_spent || 0), 0) / 
                          (spendings.length || 1)
                        )
                      )}원
                    </h3>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="summary-item">
                    <h6 className="text-muted">소비 내역 수</h6>
                    <h3>{spendings.length}건</h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
        
        {/* 추가 모달 */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>소비 내역 추가</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>금액 *</Form.Label>
                <Form.Control
                  type="number"
                  name="total_spent"
                  value={newSpending.total_spent}
                  onChange={handleInputChange}
                  placeholder="금액을 입력하세요"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>카테고리 *</Form.Label>
                <Form.Select
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
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>날짜</Form.Label>
                <DatePicker
                  selected={newSpending.ta_ymd}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  maxDate={new Date()}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>설명</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={newSpending.description}
                  onChange={handleInputChange}
                  placeholder="구매 내역이나 메모를 입력하세요"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>성별</Form.Label>
                <Form.Select
                  name="sex"
                  value={newSpending.sex}
                  onChange={handleInputChange}
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>연령대</Form.Label>
                <Form.Select
                  name="age"
                  value={newSpending.age}
                  onChange={handleInputChange}
                >
                  <option value="5">50대</option>
                  <option value="6">60대</option>
                  <option value="7">70대</option>
                  <option value="8">80대</option>
                  <option value="9">90대</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleAddSpending}>
              추가하기
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* 편집 모달 */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>소비 내역 수정</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSpending && (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>금액 *</Form.Label>
                  <Form.Control
                    type="number"
                    name="total_spent"
                    value={selectedSpending.total_spent}
                    onChange={handleSelectedInputChange}
                    placeholder="금액을 입력하세요"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>카테고리 *</Form.Label>
                  <Form.Select
                    name="card_tpbuz_nm_1"
                    value={selectedSpending.card_tpbuz_nm_1}
                    onChange={handleSelectedInputChange}
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
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>날짜</Form.Label>
                  <DatePicker
                    selected={selectedSpending.ta_ymd}
                    onChange={handleSelectedDateChange}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                    maxDate={new Date()}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>설명</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={selectedSpending.description || ''}
                    onChange={handleSelectedInputChange}
                    placeholder="구매 내역이나 메모를 입력하세요"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>성별</Form.Label>
                  <Form.Select
                    name="sex"
                    value={selectedSpending.sex}
                    onChange={handleSelectedInputChange}
                  >
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>연령대</Form.Label>
                  <Form.Select
                    name="age"
                    value={selectedSpending.age}
                    onChange={handleSelectedInputChange}
                  >
                    <option value="5">50대</option>
                    <option value="6">60대</option>
                    <option value="7">70대</option>
                    <option value="8">80대</option>
                    <option value="9">90대</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={handleEditSpending}>
              저장하기
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* 삭제 확인 모달 */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>소비 내역 삭제</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>정말로 이 소비 내역을 삭제하시겠습니까?</p>
            {selectedSpending && (
              <div className="border p-3 rounded">
                <p className="mb-2">
                  <strong>날짜:</strong> {selectedSpending.ta_ymd ? 
                    `${selectedSpending.ta_ymd.substring(0, 4)}-${selectedSpending.ta_ymd.substring(4, 6)}-${selectedSpending.ta_ymd.substring(6, 8)}` : 
                    '날짜 정보 없음'}
                </p>
                <p className="mb-2">
                  <strong>카테고리:</strong> {selectedSpending.card_tpbuz_nm_1 || '정보 없음'}
                </p>
                <p className="mb-2">
                  <strong>금액:</strong> {formatCurrency(selectedSpending.total_spent)}원
                </p>
                <p className="mb-0">
                  <strong>설명:</strong> {selectedSpending.description || '설명 없음'}
                </p>
              </div>
            )}
            <Alert variant="warning" className="mt-3">
              이 작업은 되돌릴 수 없습니다.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDeleteSpending}>
              삭제하기
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ConsumptionHistory;