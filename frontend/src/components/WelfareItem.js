// frontend/src/components/WelfareItem.js

import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaMoneyBillWave, FaHome, FaHospital, FaGraduationCap, FaMusic, FaBriefcase } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './WelfareItem.css'; // 새로운 CSS 파일 추가

const WelfareItem = ({ service, onDetailClick }) => {
  const navigate = useNavigate();
  
  // 카테고리에 맞는 아이콘과 색상 선택 (기타 카테고리 삭제)
  const getCategoryInfo = (category) => {
    switch (category) {
      case '생계':
        return { icon: <FaMoneyBillWave className="me-2" />, color: 'success' };
      case '주거':
        return { icon: <FaHome className="me-2" />, color: 'primary' };
      case '의료':
        return { icon: <FaHospital className="me-2" />, color: 'danger' };
      case '교육':
        return { icon: <FaGraduationCap className="me-2" />, color: 'warning' };
      case '문화':
        return { icon: <FaMusic className="me-2" />, color: 'info' };
      case '고용':
        return { icon: <FaBriefcase className="me-2" />, color: 'secondary' };
      default:
        // 기타 카테고리는 표시하지 않음
        return { icon: null, color: 'light', visible: false };
    }
  };
  
  // 대상자 목록 출력
  const renderTargetAudience = (targets) => {
    if (!targets || targets.length === 0) return '전체';
    
    return targets.slice(0, 2).join(', ') + (targets.length > 2 ? ' 외' : '');
  };
  
  // 서비스명 가져오기
  const getServiceTitle = () => {
    return service.서비스명 || service.title || '서비스명 없음';
  };
  
  // 서비스 요약 가져오기
  const getServiceDescription = () => {
    return service.서비스요약 || service.description || '서비스 설명 없음';
  };
  
  // 카테고리 가져오기
  const getCategory = () => {
    return service.category || '';  // 기타 카테고리는 빈 문자열로 처리
  };
  
  // 대상자 정보 가져오기
  const getTargetAudience = () => {
    return service.targetAudience || [];
  };
  
  // 제공자 가져오기
  const getProvider = () => {
    return service.provider || service.소관부처명 || '정보 없음';
  };
  
  const handleClick = () => {
    if (onDetailClick) {
      onDetailClick();
    } else {
      navigate(`/welfare-services/${service._id || service.id}`);
    }
  };
  
  const categoryInfo = getCategoryInfo(getCategory());
  
  return (
    <Card className="welfare-item mb-3 shadow-sm hover-effect" onClick={handleClick}>
      <Card.Body>
        <div className="d-flex align-items-start">
          {categoryInfo.visible !== false && (
            <Badge bg={categoryInfo.color} className="me-3 p-2" style={{ fontSize: '1rem', minWidth: '80px', textAlign: 'center' }}>
              {categoryInfo.icon}
              {getCategory()}
            </Badge>
          )}
          
          <div className="flex-grow-1">
            <h5 className="card-title fw-bold">{getServiceTitle()}</h5>
            <p className="card-text text-muted">{getServiceDescription()}</p>
            
            <div className="welfare-meta mt-3 d-flex flex-wrap align-items-center">
              <span className="me-3">
                <strong>대상:</strong> {renderTargetAudience(getTargetAudience())}
              </span>
              
              <span>
                <strong>제공:</strong> {getProvider()}
              </span>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WelfareItem;