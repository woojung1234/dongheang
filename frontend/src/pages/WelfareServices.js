// frontend/src/pages/WelfareServices.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaSync, FaPrint } from 'react-icons/fa';
import { Container, Card, Button, Spinner, Alert, Form, Pagination } from 'react-bootstrap';
import Header from '../components/Header';
import WelfareItem from '../components/WelfareItem';
import { getWelfareServices, searchWelfareServices, syncWelfareServices } from '../services/welfareService';

const WelfareServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // 한 페이지에 더 많은 서비스 표시
    total: 0,
    pages: 0
  });
  const [syncing, setSyncing] = useState(false);

  // 복지 서비스 불러오기
  useEffect(() => {
    fetchServices(1); // 첫 페이지부터 시작
  }, []);
  
  const fetchServices = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log('복지 서비스 데이터 불러오는 중...', { page });
      
      const response = await getWelfareServices('', page, pagination.limit);
      
      console.log('복지 서비스 응답:', response);
      
      if (response.success) {
        // 서비스 데이터와 함께 페이지네이션 정보도 저장
        setServices(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.pages
        });
      } else {
        setError('서비스 데이터를 불러오는데 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('복지 서비스 데이터 로드 오류:', error);
      setError('복지 서비스를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 검색 처리
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchServices();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('복지 서비스 검색 중...', searchTerm);
      
      const response = await searchWelfareServices(searchTerm, 1, pagination.limit);
      
      console.log('복지 서비스 검색 응답:', response);
      
      if (response.success) {
        setServices(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.pages
        });
      } else {
        setError('서비스 검색에 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('복지 서비스 검색 오류:', error);
      setError('복지 서비스 검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 페이지 변경 처리
  const handlePageChange = (newPage) => {
    if (searchTerm.trim()) {
      // 검색 중일 때는 검색 결과에서 페이지만 변경
      handleSearchWithPage(newPage);
    } else {
      // 일반 목록 조회
      fetchServices(newPage);
    }
  };
  
  // 페이지 번호와 함께 검색
  const handleSearchWithPage = async (page) => {
    try {
      setLoading(true);
      
      const response = await searchWelfareServices(searchTerm, page, pagination.limit);
      
      if (response.success) {
        setServices(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.pages
        });
      } else {
        setError('서비스 검색에 실패했습니다.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('복지 서비스 검색 오류:', error);
      setError('복지 서비스 검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 복지 데이터 동기화 (관리자용)
  const handleSyncData = async () => {
    try {
      setSyncing(true);
      setSuccess(null);
      setError(null);
      
      const response = await syncWelfareServices();
      
      if (response.success) {
        setSuccess(`복지 서비스 동기화가 완료되었습니다. ${response.stats?.added || 0}건 추가, ${response.stats?.updated || 0}건 업데이트됨.`);
        // 동기화 후 첫 페이지 다시 불러오기
        fetchServices(1);
      } else {
        setError('복지 서비스 동기화에 실패했습니다.');
      }
      
      setSyncing(false);
    } catch (error) {
      console.error('복지 서비스 동기화 오류:', error);
      setError('복지 서비스 동기화 중 오류가 발생했습니다.');
      setSyncing(false);
    }
  };
  
  // 상세 페이지로 이동
  const navigateToDetailPage = (serviceId) => {
    navigate(`/welfare-services/${serviceId}`);
  };
  
  // 페이지네이션 렌더링
  const renderPagination = () => {
    const items = [];
    
    // 이전 페이지 버튼
    items.push(
      <Pagination.Prev 
        key="prev" 
        disabled={pagination.page === 1}
        onClick={() => handlePageChange(pagination.page - 1)}
      />
    );
    
    // 처음 페이지
    if (pagination.page > 2) {
      items.push(
        <Pagination.Item 
          key={1}
          onClick={() => handlePageChange(1)}
        >
          1
        </Pagination.Item>
      );
      
      if (pagination.page > 3) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    // 현재 페이지 주변 페이지
    for (let i = Math.max(1, pagination.page - 1); i <= Math.min(pagination.pages, pagination.page + 1); i++) {
      items.push(
        <Pagination.Item 
          key={i}
          active={i === pagination.page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // 마지막 페이지
    if (pagination.page < pagination.pages - 1) {
      if (pagination.page < pagination.pages - 2) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      
      items.push(
        <Pagination.Item 
          key={pagination.pages}
          onClick={() => handlePageChange(pagination.pages)}
        >
          {pagination.pages}
        </Pagination.Item>
      );
    }
    
    // 다음 페이지 버튼
    items.push(
      <Pagination.Next 
        key="next" 
        disabled={pagination.page === pagination.pages}
        onClick={() => handlePageChange(pagination.page + 1)}
      />
    );
    
    return <Pagination>{items}</Pagination>;
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
            <h1 className="mb-0">복지 서비스</h1>
          </div>
          
          <div>
            <Button 
              variant="outline-primary" 
              className="me-2"
              onClick={() => window.print()}
              title="인쇄하기"
            >
              <FaPrint /> 인쇄
            </Button>
            
            <Button 
              variant="outline-primary" 
              onClick={handleSyncData}
              disabled={syncing}
              title="복지 서비스 정보 업데이트"
            >
              <FaSync className={syncing ? 'fa-spin' : ''} /> {syncing ? '동기화 중...' : '최신 정보 가져오기'}
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
        
        {/* 검색 입력란 */}
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <Form.Group className="mb-0">
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="찾고 계신 복지 서비스를 검색하세요..."
                    className="me-2"
                    size="lg"
                  />
                  <Button 
                    variant="primary"
                    type="submit"
                    size="lg"
                  >
                    <FaSearch /> 검색
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
        
        {/* 안내 문구 */}
        <div className="mb-4">
          {!loading && (
            <h4 className="text-center">
              총 <strong>{pagination.total}</strong>개의 복지 서비스가 있습니다.
              {searchTerm && (
                <> "<strong>{searchTerm}</strong>" 검색 결과</>
              )}
            </h4>
          )}
        </div>
        
        {/* 로딩 상태 */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 fs-5">복지 서비스를 불러오는 중...</p>
          </div>
        ) : services.length > 0 ? (
          <>
            {/* 서비스 목록 */}
            <div className="mb-4">
              <div className="welfare-list">
                {services.map(service => (
                  <WelfareItem 
                    key={service._id || service.id} 
                    service={service}
                    onDetailClick={() => navigateToDetailPage(service._id || service.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* 페이지네이션 */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-center mb-4">
                {renderPagination()}
              </div>
            )}
          </>
        ) : (
          // 검색 결과가 없는 경우
          <Card className="text-center py-5">
            <Card.Body>
              <p className="mb-3 fs-5">검색 결과가 없습니다.</p>
              {searchTerm && (
                <div className="mt-3">
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setSearchTerm('');
                      fetchServices(1);
                    }}
                    size="lg"
                  >
                    모든 서비스 보기
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default WelfareServices;