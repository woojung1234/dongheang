import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaCheck, FaArrowLeft } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import './RegisterProfile.css';

const RegisterProfile = () => {
  const { isAuthenticated, user, updateProfile, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: 'unspecified',
    region: '',
    interests: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  
  // 비로그인 상태면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
    
    // 이미 프로필 정보가 있으면 불러오기
    if (user) {
      setFormData(prev => ({
        ...prev,
        age: user.age || '',
        gender: user.gender || 'unspecified',
        region: user.region || '',
        interests: user.interests || []
      }));
    }
  }, [isAuthenticated, authLoading, user, navigate]);
  
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
  
  const nextStep = () => {
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        // 프로필 업데이트 성공 시 홈페이지로 이동
        navigate('/');
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
  
  const handleSkip = () => {
    navigate('/');
  };
  
  if (authLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }
  
  return (
    <div className="register-profile-container">
      <div className="register-card">
        <div className="register-header">
          <h2>프로필 설정</h2>
          <p>맞춤형 복지 혜택을 추천받기 위해 정보를 입력해주세요</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          {step === 1 && (
            <div className="form-step">
              <h3>
                <FaUser className="step-icon" />
                기본 정보
              </h3>
              
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
              
              <div className="form-actions">
                <button type="button" className="next-btn" onClick={nextStep}>
                  다음
                </button>
                <button type="button" className="skip-btn" onClick={handleSkip}>
                  건너뛰기
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="form-step">
              <h3>
                <FaMapMarkerAlt className="step-icon" />
                거주 지역
              </h3>
              
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
              
              <div className="form-actions">
                <button type="button" className="prev-btn" onClick={prevStep}>
                  <FaArrowLeft /> 이전
                </button>
                <button type="button" className="next-btn" onClick={nextStep}>
                  다음
                </button>
                <button type="button" className="skip-btn" onClick={handleSkip}>
                  건너뛰기
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="form-step">
              <h3>
                <FaCheck className="step-icon" />
                관심 분야
              </h3>
              
              <div className="form-group">
                <label>관심 있는 복지 분야를 선택해주세요 (여러 개 선택 가능)</label>
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
              
              <div className="form-actions">
                <button type="button" className="prev-btn" onClick={prevStep}>
                  <FaArrowLeft /> 이전
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? '저장 중...' : '완료'}
                </button>
                <button type="button" className="skip-btn" onClick={handleSkip}>
                  건너뛰기
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterProfile;