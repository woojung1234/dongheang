// frontend/src/components/AccessibilityControls.js
import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FaFont, FaMinus, FaPlus, FaMoon, FaSun } from 'react-icons/fa';

const AccessibilityControls = () => {
  // 로컬 스토리지에서 설정 불러오기
  const [fontSizeLevel, setFontSizeLevel] = useState(() => {
    const saved = localStorage.getItem('fontSizeLevel');
    return saved !== null ? parseInt(saved) : 1;
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    const saved = localStorage.getItem('highContrast');
    return saved === 'true';
  });
  
  // 컴포넌트 마운트 시 설정 적용
  React.useEffect(() => {
    // 폰트 크기 적용
    document.documentElement.style.setProperty('--font-size-multiplier', 1 + (fontSizeLevel * 0.25));
    
    // 고대비 모드 적용
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [fontSizeLevel, highContrast]);
  
  // 폰트 크기 조절
  const increaseFontSize = () => {
    if (fontSizeLevel < 3) {
      const newLevel = fontSizeLevel + 1;
      setFontSizeLevel(newLevel);
      localStorage.setItem('fontSizeLevel', newLevel.toString());
    }
  };
  
  const decreaseFontSize = () => {
    if (fontSizeLevel > 0) {
      const newLevel = fontSizeLevel - 1;
      setFontSizeLevel(newLevel);
      localStorage.setItem('fontSizeLevel', newLevel.toString());
    }
  };
  
  // 고대비 모드 토글
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
  };
  
  return (
    <div className="accessibility-controls">
      <ButtonGroup>
        <Button 
          variant="outline-secondary" 
          onClick={decreaseFontSize} 
          title="글자 크기 줄이기"
          aria-label="글자 크기 줄이기"
          disabled={fontSizeLevel === 0}
        >
          <FaMinus />
        </Button>
        <Button 
          variant="outline-secondary" 
          title="글자 크기"
          aria-label={`현재 글자 크기 레벨: ${fontSizeLevel + 1}`}
        >
          <FaFont />
        </Button>
        <Button 
          variant="outline-secondary" 
          onClick={increaseFontSize} 
          title="글자 크기 키우기"
          aria-label="글자 크기 키우기"
          disabled={fontSizeLevel === 3}
        >
          <FaPlus />
        </Button>
      </ButtonGroup>
      
      <Button
        variant={highContrast ? "primary" : "outline-primary"}
        className="ms-2"
        onClick={toggleHighContrast}
        title={highContrast ? "일반 모드로 전환" : "고대비 모드로 전환"}
        aria-label={highContrast ? "일반 모드로 전환" : "고대비 모드로 전환"}
      >
        {highContrast ? <FaMoon /> : <FaSun />}
      </Button>
    </div>
  );
};

export default AccessibilityControls;