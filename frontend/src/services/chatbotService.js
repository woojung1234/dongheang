import api from './api';

// 챗봇 메시지 전송
export const sendMessage = async (message, sessionId = null) => {
  try {
    const response = await api.post('/chatbot/message', {
      message,
      sessionId
    });
    return response.data;
  } catch (error) {
    console.error('챗봇 메시지 전송 오류:', error);
    throw error;
  }
};

// 대화 내역 조회
export const getChatHistory = async (sessionId = null, limit = 50) => {
  try {
    const params = { limit };
    if (sessionId) params.sessionId = sessionId;
    
    const response = await api.get('/chatbot/history', { params });
    return response.data;
  } catch (error) {
    console.error('대화 내역 조회 오류:', error);
    throw error;
  }
};

// 대화 세션 목록 조회
export const getChatSessions = async () => {
  try {
    const response = await api.get('/chatbot/sessions');
    return response.data;
  } catch (error) {
    console.error('대화 세션 목록 조회 오류:', error);
    throw error;
  }
};
