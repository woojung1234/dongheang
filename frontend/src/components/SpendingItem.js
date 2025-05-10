import React from 'react';
import { 
  FaShoppingCart, FaHandsHelping, FaGamepad, 
  FaUtensils, FaGraduationCap, FaHospital, 
  FaTicketAlt, FaBuilding, FaMobileAlt, 
  FaEllipsisH, FaTrash 
} from 'react-icons/fa';

const SpendingItem = ({ spending, onDelete }) => {
  // 카테고리에 맞는 아이콘 선택 (card_tpbuz_nm_1 기준)
  const getCategoryIcon = (category) => {
    switch (category) {
      case '소매/유통':
        return <FaShoppingCart />;
      case '생활서비스':
        return <FaHandsHelping />;
      case '여가/오락':
        return <FaGamepad />;
      case '음식':
        return <FaUtensils />;
      case '학문/교육':
        return <FaGraduationCap />;
      case '의료/건강':
        return <FaHospital />;
      case '공연/전시':
        return <FaTicketAlt />;
      case '공공/기업/단체':
        return <FaBuilding />;
      case '미디어/통신':
        return <FaMobileAlt />;
      default:
        return <FaEllipsisH />;
    }
  };
  
  // 날짜 포맷 변환 (ta_ymd가 20250201 같은 형식)
  const formatDate = (dateNum) => {
    // 숫자형식(20250201)을 문자열로 변환
    const dateStr = String(dateNum);
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    
    // 다른 형식의 날짜가 있는 경우 처리
    if (typeof dateNum === 'string' && dateNum.includes('-')) {
      return dateNum;
    }
    
    // 기본 처리: Date 객체
    const date = new Date(dateNum);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 숫자 금액 형식화 (total_spent)
  const formatAmount = (amount) => {
    return parseInt(amount).toLocaleString() + '원';
  };
  
  return (
    <div className="spending-item">
      <div className="category-icon">
        {getCategoryIcon(spending.card_tpbuz_nm_1 || spending.category)}
      </div>
      <div className="spending-details">
        <div className="spending-title">
          {spending.description || spending.card_tpbuz_nm_1 || spending.category}
        </div>
        <div className="spending-info">
          <span className="spending-category">{spending.card_tpbuz_nm_1 || spending.category}</span>
          <span className="spending-date">{formatDate(spending.ta_ymd || spending.date)}</span>
          <span className="spending-info-age">연령대: {spending.age}0대</span>
          <span className="spending-info-gender">{spending.sex === 'M' ? '남성' : '여성'}</span>
        </div>
      </div>
      <div className="spending-amount">
        {formatAmount(spending.total_spent || spending.amount)}
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