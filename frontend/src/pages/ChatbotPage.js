// src/pages/ChatbotPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import Chatbot from '../components/Chatbot';
import { sendMessage, getChatHistory } from '../services/chatbotService';
import Header from '../components/Header';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(`session_${Date.now()}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 대화 내역 불러오기
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        
        // 이전 세션이 있는지 로컬 스토리지 확인
        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId) {
          setChatSessionId(savedSessionId);
        } else {
          // 새 세션 ID 생성 및 저장
          const newSessionId = `session_${Date.now()}`;
          setChatSessionId(newSessionId);
          localStorage.setItem('chatSessionId', newSessionId);
        }
        
        // 대화 내역 불러오기 (실제 API 연동)
        const response = await getChatHistory(savedSessionId || chatSessionId);
        
        if (response.success && Array.isArray(response.data)) {
          // API 응답으로 받은 메시지 형식 변환
          const formattedMessages = response.data.map(message => ({
            id: message._id || message.timestamp || Date.now(),
            sender: message.role === 'user' ? 'user' : 'bot',
            content: message.content
          }));
          
          setMessages(formattedMessages);
        } else {
          // 대화 내역이 없거나 오류가 있을 경우 기본 메시지 설정
          setMessages([
            {
              id: Date.now(),
              sender: 'bot',
              content: '안녕하세요! 금복이입니다. 금융 복지에 관한 질문이 있으신가요?'
            }
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('대화 내역 불러오기 오류:', error);
        
        // 오류 발생 시 기본 메시지 설정
        setMessages([
          {
            id: Date.now(),
            sender: 'bot',
            content: '안녕하세요! 금복이입니다. 금융 복지에 관한 질문이 있으신가요?'
          }
        ]);
        setError('대화 내역을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };
    
    fetchChatHistory();
  }, []);

  // 메시지 전송 처리
  const handleSendMessage = async (message) => {
    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // 로딩 메시지 표시
      const loadingMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        content: '생각 중...',
        isLoading: true
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      // API 호출 (실제 API 연동)
      const response = await sendMessage(message, chatSessionId);
      
      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // 봇 응답 추가
      if (response.success) {
        const botMessage = {
          id: Date.now() + 2,
          sender: 'bot',
          content: response.data.message.content
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('응답 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('챗봇 메시지 전송 오류:', error);
      
      // 로딩 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // 오류 메시지 표시
      const errorMessage = {
        id: Date.now() + 3,
        sender: 'bot',
        content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 새 대화 시작
  const handleNewChat = () => {
    // 새 세션 ID 생성 및 저장
    const newSessionId = `session_${Date.now()}`;
    setChatSessionId(newSessionId);
    localStorage.setItem('chatSessionId', newSessionId);
    
    // 메시지 초기화
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        content: '안녕하세요! 금복이입니다. 새로운 대화를 시작합니다. 무엇을 도와드릴까요?'
      }
    ]);
  };

  return (
    <div className="page-container">
      <Header />
      
      <div className="page-content">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft />
          </button>
          <h1>금복이와 대화하기</h1>
          <Button 
            variant="outline-primary" 
            className="ms-auto"
            onClick={handleNewChat}
          >
            새 대화
          </Button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <Card className="chatbot-page-card">
          <Card.Body>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">로딩 중...</span>
                </div>
                <p className="mt-2">대화 내역을 불러오는 중...</p>
              </div>
            ) : (
              <Chatbot 
                messages={messages} 
                onSendMessage={handleSendMessage} 
              />
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;