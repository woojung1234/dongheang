import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaBell, FaInfoCircle, FaHeartbeat, FaCalendarAlt, FaMoneyBill } from 'react-icons/fa';
import api from '../services/api';
import './Notifications.css';
import Header from '../components/Header';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 알림 데이터 가져오기
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // 실제 API 호출 (구현되면 주석 해제)
        /*
        const response = await api.get('/api/notifications');
        // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
        
        if (response.data.success) {
          setNotifications(response.data.data);
        } else {
          throw new Error('알림을 불러오는데 실패했습니다.');
        }
        */
        
        // 임시 데이터 (실제 API 연동 전까지 사용)
        setTimeout(() => {
          const dummyNotifications = [
            {
              id: 1,
              type: 'info',
              title: '복지 서비스 추천',
              message: '귀하의 연령대에 맞는 새로운 복지 서비스가 있습니다: 노인 맞춤 돌봄 서비스',
              link: '/welfare-services/1',
              read: false,
              createdAt: new Date(2025, 4, 9, 10, 30)
            },
            {
              id: 2,
              type: 'reminder',
              title: '예산 알림',
              message: '이번 달 예산의 80%를 사용하셨습니다. 지출 관리에 주의하세요.',
              link: '/reports',
              read: true,
              createdAt: new Date(2025, 4, 8, 15, 45)
            },
            {
              id: 3,
              type: 'health',
              title: '건강 검진 알림',
              message: '노인 건강 검진 예약을 하시면 약 20%의 의료비를 절약할 수 있습니다.',
              link: '/welfare-services',
              read: false,
              createdAt: new Date(2025, 4, 7, 9, 20)
            },
            {
              id: 4,
              type: 'event',
              title: '특별 이벤트',
              message: '5월 노인 복지 박람회가 다음 주 금요일에 개최됩니다. 관심 있으신가요?',
              link: '/chatbot',
              read: false,
              createdAt: new Date(2025, 4, 6, 14, 10)
            },
            {
              id: 5,
              type: 'finance',
              title: '금융 상품 알림',
              message: '고령자 맞춤형 저축 상품이 새롭게 출시되었습니다. 자세히 알아보세요.',
              link: '/reports',
              read: true,
              createdAt: new Date(2025, 4, 5, 11, 25)
            }
          ];
          
          setNotifications(dummyNotifications);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('알림 데이터 로드 오류:', error);
        setError('알림을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  // 알림 읽음 처리
  const markAsRead = async (id) => {
    try {
      // 실제 API 호출 (구현되면 주석 해제)
      /*
      const response = await api.put(`/api/notifications/${id}/read`);
      // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
      
      if (response.data.success) {
        // 알림 상태 업데이트
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      }
      */
      
      // 임시 데이터 처리 (실제 API 연동 전까지 사용)
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
    }
  };
  
  // 알림 삭제 처리
  const deleteNotification = async (id, e) => {
    e.stopPropagation(); // 부모 요소의 클릭 이벤트 방지
    
    try {
      // 실제 API 호출 (구현되면 주석 해제)
      /*
      const response = await api.delete(`/api/notifications/${id}`);
      // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
      
      if (response.data.success) {
        // 알림 목록에서 삭제
        setNotifications(prevNotifications => 
          prevNotifications.filter(notification => notification.id !== id)
        );
      }
      */
      
      // 임시 데이터 처리 (실제 API 연동 전까지 사용)
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('알림 삭제 오류:', error);
    }
  };
  
  // 알림 클릭 시 해당 페이지로 이동 및 읽음 처리
  const handleNotificationClick = (notification) => {
    // 읽음 처리
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // 링크가 있으면 해당 페이지로 이동
    if (notification.link) {
      navigate(notification.link);
    }
  };
  
  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      // 실제 API 호출 (구현되면 주석 해제)
      /*
      const response = await api.put('/api/notifications/read-all');
      // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
      
      if (response.data.success) {
        // 모든 알림 읽음 처리
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
      }
      */
      
      // 임시 데이터 처리 (실제 API 연동 전까지 사용)
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error);
    }
  };
  
  // 모든 알림 삭제 처리
  const deleteAllNotifications = async () => {
    try {
      // 실제 API 호출 (구현되면 주석 해제)
      /*
      const response = await api.delete('/api/notifications');
      // Authorization 헤더는 api 인터셉터에서 자동으로 추가됨
      
      if (response.data.success) {
        // 모든 알림 삭제
        setNotifications([]);
      }
      */
      
      // 임시 데이터 처리 (실제 API 연동 전까지 사용)
      setNotifications([]);
    } catch (error) {
      console.error('모든 알림 삭제 오류:', error);
    }
  };
  
  // 알림 타입에 따른 아이콘 렌더링
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle className="notification-icon info" />;
      case 'reminder':
        return <FaBell className="notification-icon reminder" />;
      case 'health':
        return <FaHeartbeat className="notification-icon health" />;
      case 'event':
        return <FaCalendarAlt className="notification-icon event" />;
      case 'finance':
        return <FaMoneyBill className="notification-icon finance" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (date) => {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `오늘 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffInDays === 1) {
      return `어제 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    }
  };
  
  // 읽지 않은 알림 수 계산
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="page-container">
     
      
      <div className="notifications-page">
        {/* 페이지 헤더 */}
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft />
          </button>
          <h1>알림</h1>
        </div>
        
        {/* 알림 헤더 */}
        <div className="notifications-header">
          <div className="notification-count">
            {unreadCount > 0 ? (
              <span className="unread-count">{unreadCount}개의 읽지 않은 알림</span>
            ) : (
              <span>모든 알림을 읽었습니다</span>
            )}
          </div>
          
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button className="action-btn" onClick={markAllAsRead}>
                모두 읽음
              </button>
            )}
            
            {notifications.length > 0 && (
              <button className="action-btn" onClick={deleteAllNotifications}>
                모두 삭제
              </button>
            )}
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* 로딩 상태 */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>알림 불러오는 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-notifications">
            <FaBell className="empty-icon" />
            <p>알림이 없습니다</p>
          </div>
        ) : (
          /* 알림 목록 */
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  {renderNotificationIcon(notification.type)}
                  
                  <div className="notification-text">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>
                
                <button 
                  className="delete-btn"
                  onClick={(e) => deleteNotification(notification.id, e)}
                  aria-label="알림 삭제"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;