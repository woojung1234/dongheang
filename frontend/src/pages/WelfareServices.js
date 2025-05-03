import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import axios from 'axios';

// 컴포넌트
import Header from '../components/Header';
import WelfareItem from '../components/WelfareItem';

const WelfareServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeService, setActiveService] = useState(null);
  
  // 복지 서비스 불러오기
  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('복지 서비스 데이터 불러오는 중...');
      
      // 실제 API 호출 대신 더미 데이터 사용 (개발 단계)
      // const response = await axios.get('/api/welfare', {
      //   params: { category: selectedCategory }
      // });
      
      // 더미 데이터
      const dummyData = [
        {
          id: '1',
          title: '기초연금',
          description: '만 65세 이상 어르신들의 안정된 노후생활을 위한 기초연금 지원',
          category: '생계',
          targetAudience: ['65세 이상', '저소득층'],
          eligibilityCriteria: '만 65세 이상, 소득인정액 선정기준액 이하',
          benefitDetails: '월 최대 30만원 지원',
          applicationMethod: '주민센터 또는 복지로 홈페이지에서 신청',
          provider: '보건복지부'
        },
        {
          id: '2',
          title: '청년월세 특별지원',
          description: '코로나19로 어려움을 겪는 청년층의 주거비 부담 완화를 위한 지원',
          category: '주거',
          targetAudience: ['19~34세', '무주택자'],
          eligibilityCriteria: '19~34세, 부모 합산 연소득 6천만원 이하, 월세 60만원 이하',
          benefitDetails: '월 최대 20만원, 최대 12개월 지원',
          applicationMethod: '주민센터 또는 복지로 홈페이지에서 신청',
          provider: '국토교통부'
        },
        {
          id: '3',
          title: '의료급여',
          description: '생활이 어려운 사람에게 의료비를 지원하여 국민 보건 향상과 사회복지 증진에 기여',
          category: '의료',
          targetAudience: ['기초생활수급자', '차상위계층'],
          eligibilityCriteria: '국민기초생활보장법에 의한 수급자',
          benefitDetails: '진찰, 검사, 약제, 치료, 입원, 간호 등 의료서비스 지원',
          applicationMethod: '주민센터에서 신청',
          provider: '보건복지부'
        },
        {
          id: '4',
          title: '문화누리카드',
          description: '소외계층에게 문화예술, 국내여행, 체육활동 등의 문화복지 지원',
          category: '문화',
          targetAudience: ['기초생활수급자', '차상위계층'],
          eligibilityCriteria: '6세 이상 기초생활수급자 및 차상위계층',
          benefitDetails: '1인당 연간 최대 10만원 지원',
          applicationMethod: '주민센터 또는 문화누리카드 홈페이지에서 신청',
          provider: '문화체육관광부'
        }
      ];
      
      // 카테고리 필터링 (더미 데이터용)
      let filteredData = dummyData;
      if (selectedCategory) {
        filteredData = dummyData.filter(service => service.category === selectedCategory);
      }
      
      // 1초 지연 (로딩 시뮬레이션)
      setTimeout(() => {
        console.log('복지 서비스 데이터 로드 완료:', filteredData);
        setServices(filteredData);
        setLoading(false);
      }, 1000);
      
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
      console.log('복지 서비스 검색 중...', searchTerm);
      
      // 실제 API 호출 대신 더미 데이터 검색 (개발 단계)
      // const response = await axios.get('/api/welfare/search', {
      //   params: { keyword: searchTerm }
      // });
      
      // 더미 데이터 검색
      const dummyData = [
        {
          id: '1',
          title: '기초연금',
          description: '만 65세 이상 어르신들의 안정된 노후생활을 위한 기초연금 지원',
          category: '생계',
          targetAudience: ['65세 이상', '저소득층'],
          eligibilityCriteria: '만 65세 이상, 소득인정액 선정기준액 이하',
          benefitDetails: '월 최대 30만원 지원',
          applicationMethod: '주민센터 또는 복지로 홈페이지에서 신청',
          provider: '보건복지부'
        },
        {
          id: '2',
          title: '청년월세 특별지원',
          description: '코로나19로 어려움을 겪는 청년층의 주거비 부담 완화를 위한 지원',
          category: '주거',
          targetAudience: ['19~34세', '무주택자'],
          eligibilityCriteria: '19~34세, 부모 합산 연소득 6천만원 이하, 월세 60만원 이하',
          benefitDetails: '월 최대 20만원, 최대 12개월 지원',
          applicationMethod: '주민센터 또는 복지로 홈페이지에서 신청',
          provider: '국토교통부'
        },
        {
          id: '3',
          title: '의료급여',
          description: '생활이 어려운 사람에게 의료비를 지원하여 국민 보건 향상과 사회복지 증진에 기여',
          category: '의료',
          targetAudience: ['기초생활수급자', '차상위계층'],
          eligibilityCriteria: '국민기초생활보장법에 의한 수급자',
          benefitDetails: '진찰, 검사, 약제, 치료, 입원, 간호 등 의료서비스 지원',
          applicationMethod: '주민센터에서 신청',
          provider: '보건복지부'
        },
        {
          id: '4',
          title: '문화누리카드',
          description: '소외계층에게 문화예술, 국내여행, 체육활동 등의 문화복지 지원',
          category: '문화',
          targetAudience: ['기초생활수급자', '차상위계층'],
          eligibilityCriteria: '6세 이상 기초생활수급자 및 차상위계층',
          benefitDetails: '1인당 연간 최대 10만원 지원',
          applicationMethod: '주민센터 또는 문화누리카드 홈페이지에서 신청',
          provider: '문화체육관광부'
        }
      ];
      
      // 검색어 필터링 (더미 데이터용)
      const searchResults = dummyData.filter(service => 
        service.title.includes(searchTerm) || 
        service.description.includes(searchTerm) ||
        service.targetAudience.some(target => target.includes(searchTerm))
      );
      
      // 1초 지연 (로딩 시뮬레이션)
      setTimeout(() => {
        console.log('복지 서비스 검색 완료:', searchResults);
        setServices(searchResults);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('복지 서비스 검색 오류:', error);
      setError('복지 서비스 검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 서비스 상세 보기
  const handleServiceClick = (service) => {
    console.log('서비스 상세 보기:', service);
    setActiveService(service);
  };
  
  // 상세 보기 닫기
  const handleCloseDetail = () => {
    setActiveService(null);
  };
  
  return (
    <div className="page-container">
      <Header />
      
      <div className="page-content">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft />
          </button>
          <h1>복지 서비스</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 검색 및 필터 */}
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="복지 서비스 검색..."
              className="search-input"
            />
            <button 
              className="search-button"
              onClick={handleSearch}
            >
              <FaSearch />
            </button>
          </div>
          
          <div className="category-filters">
            <button 
              className={`category-filter ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              전체
            </button>
            <button 
              className={`category-filter ${selectedCategory === '생계' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('생계')}
            >
              생계
            </button>
            <button 
              className={`category-filter ${selectedCategory === '주거' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('주거')}
            >
              주거
            </button>
            <button 
              className={`category-filter ${selectedCategory === '의료' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('의료')}
            >
              의료
            </button>
            <button 
              className={`category-filter ${selectedCategory === '교육' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('교육')}
            >
              교육
            </button>
            <button 
              className={`category-filter ${selectedCategory === '문화' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('문화')}
            >
              문화
            </button>
          </div>
        </div>
        
        {/* 복지 서비스 목록 */}
        <div className="welfare-list">
          {loading ? (
            <div className="loading">복지 서비스를 불러오는 중...</div>
          ) : services.length > 0 ? (
            services.map(service => (
              <WelfareItem 
                key={service.id} 
                service={service}
                onClick={() => handleServiceClick(service)}
              />
            ))
          ) : (
            <div className="no-data">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
        
        {/* 서비스 상세 모달 */}
        {activeService && (
          <div className="modal-backdrop">
            <div className="service-detail-modal">
              <div className="modal-header">
                <h2>{activeService.title}</h2>
                <button 
                  className="close-button"
                  onClick={handleCloseDetail}
                >
                  &times;
                </button>
              </div>
              <div className="modal-content">
                <div className="service-category">{activeService.category}</div>
                <p className="service-description">{activeService.description}</p>
                
                <h3>대상</h3>
                <ul className="target-audience">
                  {activeService.targetAudience.map((target, index) => (
                    <li key={index}>{target}</li>
                  ))}
                </ul>
                
                <h3>자격 요건</h3>
                <p>{activeService.eligibilityCriteria}</p>
                
                <h3>혜택 내용</h3>
                <p>{activeService.benefitDetails}</p>
                
                <h3>신청 방법</h3>
                <p>{activeService.applicationMethod}</p>
                
                <h3>제공 기관</h3>
                <p>{activeService.provider}</p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={handleCloseDetail}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelfareServices;
