import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaMicrophone, FaRobot } from 'react-icons/fa';
import './Chatbot.css'; // CSS 스타일 파일 추가

const Chatbot = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 음성 인식 기능 설정
  let recognition = null;
  
  if ('webkitSpeechRecognition' in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ko-KR';
  }
  
  // 메시지가 업데이트될 때마다 스크롤 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 입력창 변경 처리
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  // 메시지 전송 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput('');
  };
  
  // 음성 인식 시작
  const startListening = () => {
    if (!recognition) {
      console.log('음성 인식 기능이 지원되지 않는 브라우저입니다.');
      return;
    }
    
    recognition.start();
    setIsListening(true);
    console.log('음성 인식 시작');
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('음성 인식 결과:', transcript);
      setInput(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('음성 인식 오류:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      console.log('음성 인식 종료');
      setIsListening(false);
    };
  };
  
  // 음성 인식 중지
  const stopListening = () => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
    console.log('음성 인식 중지');
  };
  
  // 음성 버튼 처리
  const handleVoiceButton = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // 금복이 이모지 선택
  const getBotEmoji = (message) => {
    // 메시지 내용에 따라 다른 이모지 반환
    if (message.includes('안녕') || message.includes('반가워')) {
      return '😊';
    } else if (message.includes('복지') || message.includes('혜택')) {
      return '🧐';
    } else if (message.includes('소비') || message.includes('지출')) {
      return '💰';
    } else if (message.includes('도움') || message.includes('질문')) {
      return '🤔';
    } else if (message.includes('감사')) {
      return '😄';
    } else {
      return '🤖';
    }
  };
  
  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <FaRobot size={30} color="#FF9D3D" />
        </div>
        <div className="chatbot-info">
          <div className="chatbot-name">금복이</div>
          <div className="chatbot-status">온라인</div>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message message-${message.sender}`}
          >
            <div className="message-content">
              {message.sender === 'bot' && (
                <span className="bot-emoji">{getBotEmoji(message.content)}</span>
              )}
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="금복이에게 메시지 보내기..."
          className="chat-input"
        />
        <button
          type="button"
          onClick={handleVoiceButton}
          className={`voice-button ${isListening ? 'listening' : ''}`}
          title={isListening ? '음성 인식 중지' : '음성으로 입력'}
        >
          <FaMicrophone />
        </button>
        <button
          type="submit"
          className="send-button"
          title="메시지 보내기"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;