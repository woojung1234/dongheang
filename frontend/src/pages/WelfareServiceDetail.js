// frontend/src/pages/WelfareServiceDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaPrint, FaExternalLinkAlt, FaShare, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import Header from '../components/Header';
import { getWelfareServiceById } from '../services/welfareService';

const WelfareServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  
  // 복지 서비스 상세 정보 불러오기
  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getWelfareServiceById(id);
        
        if (response.success) {
          setService(response.data);
          
          // 로컬 스토리지에서 북마크 상태 확인
          const bookmarks = JSON.parse(localStorage.getItem('welfareBookmarks') || '[]');
          setBookmarked(bookmarks.includes(id));
        } else {
          setError('서비스 정보를 불러오는데 실패했습니다.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('복지 서비스 상세 정보 로드 오류:', error);
        setError('복지 서비스 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchServiceDetail();
  }, [id]);
  
  // 북마크 토글
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('welfareBookmarks') || '[]');
    
    if (bookmarked) {
      // 북마크 제거
      const updatedBookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
      localStorage.setItem('welfareBookmarks', JSON.stringify(updatedBookmarks));
    } else {
      // 북마크 추가
      bookmarks.push(id);
      localStorage.setItem('welfareBookmarks', JSON.stringify(bookmarks));
    }
    
    setBookmarked(!bookmarked);
  };
  
  // 공유하기
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: service.서비스명 || service.title,
          text: service.서비스요약 || service.description,
          url: window.location.href
        });
      } else {
        // 클립보드에 URL 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('URL이 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('공유하기 오류:', error);
    }
  };
  
  // 카테고리 매핑
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case '생계': return 'success';
      case '주거': return 'primary';
      case '의료': return 'danger';
      case '교육': return 'warning';
      case '문화': return 'info';
      case '고용': return 'secondary';
      default: return 'light';
    }
  };
  
  return (
    <div className="page-container">
      <Header />
      
      <Container className="py-4">
      // frontend/src/pages/WelfareServiceDetail.js (계속)

<div className="d-flex justify-content-between align-items-center mb-4">
  <Button 
    variant="outline-secondary" 
    onClick={() => navigate('/welfare-services')}
    className="back-button"
  >
    <FaArrowLeft /> 목록으로
  </Button>
  
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
      className="me-2"
      onClick={handleShare}
      title="공유하기"
    >
      <FaShare /> 공유
    </Button>
    
    <Button 
      variant={bookmarked ? "primary" : "outline-primary"}
      onClick={toggleBookmark}
      title={bookmarked ? "북마크 해제" : "북마크 추가"}
    >
      {bookmarked ? <FaBookmark /> : <FaRegBookmark />} 저장
    </Button>
  </div>
</div>

{error && (
  <Alert variant="danger" className="mb-4">
    {error}
  </Alert>
)}

{loading ? (
  <div className="text-center py-5">
    <Spinner animation="border" variant="primary" />
    <p className="mt-3">복지 서비스 정보를 불러오는 중...</p>
  </div>
) : service ? (
  <>
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-primary text-white">
        <h2 className="mb-0">{service.서비스명 || service.title}</h2>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-wrap mb-3 gap-2">
          <Badge 
            bg={getCategoryBadgeColor(service.category)} 
            className="px-3 py-2"
          >
            {service.category}
          </Badge>
          
          {service.기준연도 && (
            <Badge bg="secondary" className="px-3 py-2">
              {service.기준연도}년 기준
            </Badge>
          )}
        </div>
        
        <p className="lead mb-4">
          {service.서비스요약 || service.description}
        </p>
        
        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">서비스 개요</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>제공기관:</strong> {service.provider || service.소관부처명}</p>
                {service.소관조직명 && (
                  <p><strong>소관조직:</strong> {service.소관조직명}</p>
                )}
                {service.대표문의 && (
                  <p><strong>문의처:</strong> {service.대표문의}</p>
                )}
                {service.최종수정일 && (
                  <p><strong>최종 업데이트:</strong> {service.최종수정일}</p>
                )}
                {service.region && (
                  <p><strong>지역:</strong> {service.region}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">신청 정보</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>신청 방법:</strong> {service.applicationMethod}</p>
                {service.applicationDeadline && (
                  <p>
                    <strong>신청 마감일:</strong> {new Date(service.applicationDeadline).toLocaleDateString()}
                  </p>
                )}
                {service.서비스URL && (
                  <div className="mt-3">
                    <Button 
                      variant="primary" 
                      href={service.서비스URL} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaExternalLinkAlt className="me-2" />
                      서비스 웹사이트 방문
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">대상자 정보</h5>
              </Card.Header>
              <Card.Body>
                {service.targetAudience && service.targetAudience.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {service.targetAudience.map((target, index) => (
                      <li key={index} className="list-group-item">
                        {target}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>대상자 정보가 없습니다.</p>
                )}
                
                <div className="mt-3">
                  <h6>자격 요건</h6>
                  <p>{service.eligibilityCriteria || '자격 요건 정보가 없습니다.'}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">혜택 정보</h5>
              </Card.Header>
              <Card.Body>
                <p>{service.benefitDetails || '혜택 정보가 없습니다.'}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <h3 className="mb-3">관련 링크</h3>
        <Row className="mb-4">
          {service.사이트 && (
            <Col md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <h5 className="card-title">{service.provider || service.소관부처명} 웹사이트</h5>
                  <p className="card-text text-truncate">{service.사이트}</p>
                  <Button 
                    variant="outline-primary" 
                    href={service.사이트.replace('https://www.', 'https://')} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaExternalLinkAlt className="me-2" />
                    웹사이트 방문
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
          
          {service.서비스URL && (
            <Col md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <h5 className="card-title">서비스 신청 페이지</h5>
                  <p className="card-text text-truncate">{service.서비스URL}</p>
                  <Button 
                    variant="primary" 
                    href={service.서비스URL} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaExternalLinkAlt className="me-2" />
                    서비스 신청하기
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
        
        <div className="bg-light p-4 rounded">
          <h4>알아두세요</h4>
          <p>이 정보는 {service.기준연도 || new Date().getFullYear()}년 기준으로 제공됩니다. 정확한 최신 정보는 해당 기관의 웹사이트를 방문하거나 문의처로 연락하시기 바랍니다.</p>
          <p className="mb-0">
            <strong>정보 출처:</strong> {service.provider || service.소관부처명}
            {service.최종수정일 && ` (최종 업데이트: ${service.최종수정일})`}
          </p>
        </div>
      </Card.Body>
    </Card>
    
    <div className="text-center mb-4">
      <Button 
        variant="outline-secondary" 
        onClick={() => navigate('/welfare-services')}
        className="me-2"
      >
        목록으로 돌아가기
      </Button>
      
      {service.서비스URL && (
        <Button 
          variant="primary" 
          href={service.서비스URL} 
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt className="me-2" />
          서비스 신청하기
        </Button>
      )}
    </div>
  </>
) : (
  <Alert variant="warning">
    해당 복지 서비스를 찾을 수 없습니다.
  </Alert>
)}
</Container>
</div>
);
};

export default WelfareServiceDetail;