import React from 'react';
import { FaMoneyBillWave, FaHome, FaHospital, FaGraduationCap, FaMusic, FaBriefcase, FaEllipsisH } from 'react-icons/fa';

const WelfareItem = ({ service, onClick }) => {
  // 카테고리에 맞는 아이콘 선택
  const getCategoryIcon = (category) => {
    switch (category) {
      case '생계':
        return <FaMoneyBillWave />;
      case '주거':
        return <FaHome />;
      case '의료':
        return <FaHospital />;
      case '교육':
        return <FaGraduationCap />;
      case '문화':
        return <FaMusic />;
      case '고용':
        return <FaBriefcase />;
      case '기타':
      default:
        return <FaEllipsisH />;
    }
  };
  
  // 대상자 목록 출력
  const renderTargetAudience = (targets) => {
    if (!targets || targets.length === 0) return '전체';
    
    return targets.slice(0, 2).join(', ') + (targets.length > 2 ? ' 외' : '');
  };
  
  return (
    <div className="welfare-item" onClick={onClick}>
      <div className="category-icon">
        {getCategoryIcon(service.category)}
      </div>
      <div className="welfare-details">
        <div className="welfare-title">{service.title}</div>
        <div className="welfare-description">{service.description}</div>
        <div className="welfare-info">
          <span className="welfare-category">{service.category}</span>
          <span className="welfare-target">대상: {renderTargetAudience(service.targetAudience)}</span>
          <span className="welfare-provider">제공: {service.provider}</span>
        </div>
      </div>
    </div>
  );
};

export default WelfareItem;
