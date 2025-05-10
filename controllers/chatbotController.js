const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ChatMessage = require('../models/ChatMessage');
const WelfareService = require('../models/WelfareService');
const Spending = require('../models/Spending');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\n`;
  
  fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 감정 분석 및 매핑
const analyzeEmotion = (text) => {
  // 간단한 감정 분석 로직
  const emotionKeywords = {
    happy: ['좋아', '기쁘', '행복', '좋은', '감사', '고마워', '멋져', '최고'],
    sad: ['슬퍼', '아파', '안좋', '힘들', '어려', '불행', '우울', '걱정'],
    confused: ['모르', '헷갈', '복잡', '이해가', '어떻게', '무슨', '왜'],
    surprised: ['놀라', '대박', '신기', '와우', '와', '어머', '정말']
  };
  
  let emotion = 'neutral';
  
  for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      emotion = emotionType;
      break;
    }
  }
  
  return emotion;
};

// 의도 분석
const detectIntent = (text) => {
  const intents = {
    welfare_inquiry: ['복지', '지원금', '혜택', '신청', '정부지원', '보조금'],
    spending_inquiry: ['소비', '지출', '얼마', '썼', '돈', '사용', '금액'],
    spending_add: ['기록', '추가', '저장', '입력', '썼어'],
    greeting: ['안녕', '반가워', '하이', '헬로', '뭐해', '시작'],
    help: ['도움', '어떻게', '사용법', '알려줘', '알려', '설명']
  };
  
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
};

// OpenAI GPT API 호출
const callGptApi = async (messages) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      logToFile('OpenAI API 키가 설정되지 않음', 'ERROR');
      throw new Error('API 키가 설정되지 않았습니다.');
    }
    
    // API 요청 로깅 (키는 마스킹)
    logToFile(`OpenAI API 호출: ${messages.length}개 메시지, API 키: ${openaiApiKey.substring(0, 10)}...`);
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        }
      }
    );
    
    logToFile('OpenAI API 응답 성공');
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      // OpenAI API 오류 응답
      logToFile(`OpenAI API 오류 응답: 상태 코드 ${error.response.status}, 메시지: ${JSON.stringify(error.response.data)}`, 'ERROR');
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못함
      logToFile(`OpenAI API 요청 오류: 응답 없음`, 'ERROR');
    } else {
      // 요청 설정 중 오류 발생
      logToFile(`OpenAI API 호출 전 오류: ${error.message}`, 'ERROR');
    }
    
    // 대체 응답 반환
    return "죄송합니다. 현재 AI 응답을 생성하는 데 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
};

// 복지 서비스 정보 가져오기 (최신 5개)
const getRecentWelfareInfo = async () => {
  try {
    const services = await WelfareService.find()
      .sort({ updatedAt: -1 })
      .limit(5);
    
    if (services.length === 0) {
      return "현재 등록된 복지 서비스 정보가 없습니다.";
    }
    
    return services.map(service => 
      `서비스명: ${service.title}\n설명: ${service.description}\n대상: ${service.targetAudience.join(', ')}\n혜택: ${service.benefitDetails}`
    ).join('\n\n');
  } catch (error) {
    logToFile(`복지 서비스 정보 조회 오류: ${error.message}`, 'ERROR');
    return "복지 서비스 정보를 조회할 수 없습니다.";
  }
};

// 챗봇 메시지 보내기
const sendMessage = async (req, res) => {
  try {
    logToFile(`챗봇 메시지 요청: 사용자 ID ${req.user?.id || '비로그인'}`);
    
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: '메시지 내용을 입력해주세요.' });
    }
    
    // 세션 ID 생성 또는 사용
    const chatSessionId = sessionId || `session_${Date.now()}`;
    
    // 감정 분석
    const emotion = analyzeEmotion(message);
    
    // 의도 감지
    const intent = detectIntent(message);
    
    logToFile(`사용자 메시지 분석: 의도=${intent}, 감정=${emotion}`);
    
    // 몽고디비 연결이 활성화되어 있는 경우에만 저장 시도
    let userMessage;
    try {
      // 사용자 메시지 저장
      userMessage = await ChatMessage.create({
        userId: req.user?.id || 'anonymous',
        sessionId: chatSessionId,
        role: 'user',
        content: message,
        emotion,
        intentDetected: intent
      });
      logToFile('사용자 메시지 저장 성공');
    } catch (dbError) {
      logToFile(`사용자 메시지 저장 실패: ${dbError.message}`, 'ERROR');
      // 저장 실패해도 계속 진행
    }
    
    // 이전 대화 내역 조회 (최대 10개)
    let prevMessages = [];
    try {
      prevMessages = await ChatMessage.find({ 
        sessionId: chatSessionId 
      })
      .sort({ timestamp: -1 })
      .limit(10);
      
      logToFile(`이전 대화 내역 조회: ${prevMessages.length}개 메시지`);
    } catch (dbError) {
      logToFile(`이전 대화 내역 조회 실패: ${dbError.message}`, 'ERROR');
      // 조회 실패해도 계속 진행
    }
    
    // 메시지 형식 변환 (OpenAI API용)
    const messageHistory = prevMessages.length > 0 ? 
      prevMessages
        .sort((a, b) => a.timestamp - b.timestamp) // 시간순 정렬
        .map(msg => ({
          role: msg.role,
          content: msg.content
        })) : [];
    
    // 현재 메시지가 저장 실패했다면 직접 추가
    if (messageHistory.length === 0 || messageHistory[messageHistory.length - 1].content !== message) {
      messageHistory.push({
        role: 'user',
        content: message
      });
    }
    
    // 시스템 메시지 추가
    messageHistory.unshift({
      role: 'system',
      content: `당신은 '금복이'라는 친절한 금융 복지 도우미입니다. 
      고령자와 취약계층을 위한 복지 서비스와 금융 관리를 돕습니다. 
      사용자의 질문에 간결하고 친절하게 답변해주세요. 
      복지 서비스에 대한 질문이면 관련 정보를 제공하고, 
      금융 관련 질문이면 도움이 되는 조언을 해주세요. 
      감정에 공감하며 존중하는 태도로 대화해주세요.
      당신의 이름은 '금복이'입니다.
      오늘 날짜는 2025년 4월 22일입니다.`
    });
    
    // AI 응답 생성
    let aiResponseContent;
    
    switch (intent) {
      case 'welfare_inquiry':
        // 복지 서비스 정보 가져오기
        const welfareInfo = await getRecentWelfareInfo();
        
        // 복지 서비스 관련 정보 추가
        messageHistory.push({
          role: 'system',
          content: `사용자가 복지 서비스에 관심이 있습니다. 아래 복지 서비스 정보를 참고하여 안내해주세요:\n\n${welfareInfo}`
        });
        aiResponseContent = await callGptApi(messageHistory);
        break;
        
      case 'spending_inquiry':
        // 소비 내역 관련 정보 추가
        messageHistory.push({
          role: 'system',
          content: '사용자가 소비 내역에 관심이 있습니다. 소비 내역 조회나 관리 방법을 안내해주세요. 소비내역 메뉴를 통해 지출 현황을 확인할 수 있고, 월별 리포트를 통해 분석 결과를 볼 수 있다고 안내해주세요.'
        });
        aiResponseContent = await callGptApi(messageHistory);
        break;
        
      case 'spending_add':
        // 소비 내역 추가 안내
        messageHistory.push({
          role: 'system',
          content: '사용자가 소비 내역을 추가하려고 합니다. 소비 내역 추가 방법을 안내해주세요. 소비내역 메뉴에서 "+" 버튼을 눌러 금액, 카테고리, 설명, 날짜, 결제 방법을 입력하여 추가할 수 있다고 안내해주세요.'
        });
        aiResponseContent = await callGptApi(messageHistory);
        break;
        
      default:
        // 일반 대화
        aiResponseContent = await callGptApi(messageHistory);
    }
    
    // 몽고디비 연결이 활성화된 경우에만 저장 시도
    let aiResponse;
    try {
      // AI 응답 저장
      aiResponse = await ChatMessage.create({
        userId: req.user?.id || 'anonymous',
        sessionId: chatSessionId,
        role: 'assistant',
        content: aiResponseContent,
        emotion: 'neutral', // 기본 감정
        intentDetected: intent
      });
      logToFile('AI 응답 저장 성공');
    } catch (dbError) {
      logToFile(`AI 응답 저장 실패: ${dbError.message}`, 'ERROR');
      // 저장 실패해도 계속 진행
    }
    
    logToFile(`챗봇 응답 완료: 세션 ID ${chatSessionId}`);
    
    res.json({
      success: true,
      data: {
        sessionId: chatSessionId,
        message: {
          id: aiResponse?._id || Date.now(),
          content: aiResponseContent,
          emotion: 'neutral',
          timestamp: aiResponse?.timestamp || new Date()
        }
      }
    });
  } catch (error) {
    logToFile(`챗봇 메시지 처리 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 대화 내역 조회
const getChatHistory = async (req, res) => {
  try {
    logToFile(`대화 내역 조회 요청: 사용자 ID ${req.user?.id || '비로그인'}`);
    
    const { sessionId, limit = 50 } = req.query;
    
    // 필터 조건 구성
    const filter = { userId: req.user?.id || 'anonymous' };
    if (sessionId) filter.sessionId = sessionId;
    
    // 대화 내역 조회
    const messages = await ChatMessage.find(filter)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit));
    
    logToFile(`대화 내역 조회 완료: ${messages.length}건`);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    logToFile(`대화 내역 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 대화 세션 목록 조회
const getChatSessions = async (req, res) => {
  try {
    logToFile(`대화 세션 목록 조회 요청: 사용자 ID ${req.user?.id || '비로그인'}`);
    
    // 사용자의 모든 세션 그룹화 및 최신순 정렬
    const sessions = await ChatMessage.aggregate([
      {
        $match: { userId: req.user?.id || 'anonymous' }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $first: '$content' },
          lastTimestamp: { $first: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      {
        $sort: { lastTimestamp: -1 }
      }
    ]);
    
    logToFile(`대화 세션 목록 조회 완료: ${sessions.length}건`);
    
    res.json({
      success: true,
      data: sessions.map(session => ({
        sessionId: session._id,
        lastMessage: session.lastMessage,
        lastTimestamp: session.lastTimestamp,
        messageCount: session.messageCount
      }))
    });
  } catch (error) {
    logToFile(`대화 세션 목록 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatSessions
};
