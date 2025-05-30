import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaPen, FaSignOutAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || 'unspecified',
    region: user?.region || '',
    interests: user?.interests || []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const regions = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
  ];
  
  const interestOptions = [
    { id: 'health', label: '건강/의료' },
    { id: 'housing', label: '주거/임대' },
    { id: 'education', label: '교육/장학' },
    { id: 'childcare', label: '보육/양육' },
    { id: 'employment', label: '취업/창업' },
    { id: 'living', label: '생계/생활' },
    { id: 'elderly', label: '노인복지' },
    { id: 'disability', label: '장애인복지' },
    { id: 'financial', label: '금융/재정' },
    { id: 'culture', label: '문화/여가' }
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, name]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          interests: prev.interests.filter(interest => interest !== name)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || '프로필 업데이트에 실패했습니다.');
      }
    } catch (err) {
      setError('프로필 저장 중 오류가 발생했습니다.');
      console.error('프로필 업데이트 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const formatGender = (gender) => {
    switch (gender) {
      case 'male':
        return '남성';
      case 'female':
        return '여성';
      case 'other':
        return '기타';
      default:
        return '입력 안함';
    }
  };
  
  const formatInterests = (interests) => {
    if (!interests || interests.length === 0) {
      return '설정된 관심 분야가 없습니다.';
    }
    
    return interests.map(interest => {
      const option = interestOptions.find(opt => opt.id === interest);
      return option ? option.label : interest;
    }).join(', ');
  };
  
  if (!user) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>내 프로필</h2>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <FaPen /> 프로필 수정
              </button>
            ) : (
              <button 
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                취소
              </button>
            )}
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> 로그아웃
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="profile-card">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">
                  <FaUser className="input-icon" />
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="age">
                  <FaCalendarAlt className="input-icon" />
                  나이
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="나이를 입력하세요"
                />
              </div>
              
              <div className="form-group">
                <label>
                  <FaVenusMars className="input-icon" />
                  성별
                </label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                    />
                    <span>남성</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                    />
                    <span>여성</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                    />
                    <span>기타</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="unspecified"
                      checked={formData.gender === 'unspecified'}
                      onChange={handleChange}
                    />
                    <span>입력 안함</span>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="region">
                  <FaMapMarkerAlt className="input-icon" />
                  지역
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                >
                  <option value="">지역을 선택하세요</option>
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>관심 분야</label>
                <div className="checkbox-group">
                  {interestOptions.map(option => (
                    <label key={option.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        name={option.id}
                        checked={formData.interests.includes(option.id)}
                        onChange={handleChange}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="save-button"
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <FaUser className="info-icon" />
                <div className="info-content">
                  <span className="info-label">이름</span>
                  <span className="info-value">{user.name || '이름이 설정되지 않았습니다.'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaCalendarAlt className="info-icon" />
                <div className="info-content">
                  <span className="info-label">나이</span>
                  <span className="info-value">{user.age || '설정되지 않았습니다.'}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaVenusMars className="info-icon" />
                <div className="info-content">
                  <span className="info-label">성별</span>
                  <span className="info-value">{formatGender(user.gender)}</span>
                </div>
              </div>
              
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div className="info-content">
                  <span className="info-label">지역</span>
                  <span className="info-value">{user.region || '설정되지 않았습니다.'}</span>
                </div>
              </div>
              
              <div className="info-item interests">
                <div className="info-content">
                  <span className="info-label">관심 분야</span>
                  <span className="info-value">{formatInterests(user.interests)}</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-content">
                  <span className="info-label">이메일</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;