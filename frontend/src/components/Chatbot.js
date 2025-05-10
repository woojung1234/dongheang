import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import '../pages/ChatbotPage.css';

const Chatbot = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // 메시지 시간 포맷팅
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 메시지 내용에서 추천 복지 서비스 링크 처리
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;

    // 간단한 마크다운 처리
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 볼드 텍스트
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // 이탤릭 텍스트
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>') // 코드 블록
      .replace(/`(.*?)`/g, '<code>$1</code>') // 인라인 코드
      .replace(/\n/g, '<br />'); // 줄바꿈

    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  // 로딩 인디케이터 렌더링
  const renderLoadingIndicator = () => (
    <div className="typing-indicator">
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
          >
            {message.sender === 'bot' && (
              <div className="message-avatar">
                <FaRobot />
              </div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                {message.isLoading
                  ? renderLoadingIndicator()
                  : renderMessageContent(message.content)}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp || message.id)}
              </div>
            </div>
            {message.sender === 'user' && (
              <div className="message-avatar">
                <FaUser />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={messages.some((m) => m.isLoading)}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || messages.some((m) => m.isLoading)}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;