// src/services/chatbotService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// 메시지 전송
export const sendMessage = async (message, sessionId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chatbot/message`, {
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
export const getChatHistory = async (sessionId, limit = 50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chatbot/history`, {
      params: { sessionId, limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('대화 내역 조회 오류:', error);
    throw error;
  }
};

// 대화 세션 목록 조회
export const getChatSessions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chatbot/sessions`);
    
    return response.data;
  } catch (error) {
    console.error('대화 세션 목록 조회 오류:', error);
    throw error;
  }
};

export default {
  sendMessage,
  getChatHistory,
  getChatSessions
};