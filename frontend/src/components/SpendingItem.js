import React from 'react';
import { FaUtensils, FaCar, FaHome, FaHospital, FaGraduationCap, FaMusic, FaTshirt, FaMobileAlt, FaEllipsisH, FaTrash } from 'react-icons/fa';

const SpendingItem = ({ spending, onDelete }) => {
  // 카테고리에 맞는 아이콘 선택
  const getCategoryIcon = (category) => {
    switch (category) {
      case '식비':
        return <FaUtensils />;
      case '교통':
        return <FaCar />;
      case '주거':
        return <FaHome />;
      case '의료':
        return <FaHospital />;
      case '교육':
        return <FaGraduationCap />;
      case '문화':
        return <FaMusic />;
      case '의류':
        return <FaTshirt />;
      case '통신':
        return <FaMobileAlt />;
      case '기타':
      default:
        return <FaEllipsisH />;
    }
  };
  
  // 날짜 포맷 변환
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  return (
    <div className="spending-item">
      <div className="category-icon">
        {getCategoryIcon(spending.category)}
      </div>
      <div className="spending-details">
        <div className="spending-title">{spending.description || spending.category}</div>
        <div className="spending-info">
          <span className="spending-category">{spending.category}</span>
          <span className="spending-date">{formatDate(spending.date)}</span>
          <span className="spending-payment">{spending.paymentMethod}</span>
        </div>
      </div>
      <div className="spending-amount">
        {spending.amount.toLocaleString()}원
      </div>
      <button 
        className="delete-button" 
        onClick={() => onDelete(spending.id)}
        title="삭제"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default SpendingItem;
