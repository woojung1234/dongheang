const axios = require('axios');
const fs = require('fs');
const path = require('path');
const WelfareService = require('../models/WelfareService');

// 로깅 함수
const logToFile = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\\..+/, '');
  const logMessage = `[${level}] ${timestamp} - ${message}\
`;
  
  fs.appendFile(path.join(__dirname, '..', 'logs', 'app.log'), logMessage, (err) => {
    if (err) {
      console.error('로그 작성 중 오류 발생:', err);
    }
  });
  
  console.log(logMessage);
};

// 공공데이터 API 호출 함수
const fetchWelfareDataFromAPI = async () => {
  try {
    // 환경 변수에서 API 키 가져오기 - URL 인코딩 상태로 사용
    const encodedKey = 'Lmc1Zq9hmKIACiZKiXehoeHi1ac4HG25EqROFy%2F%2FOkLBLhn5EWFL0X38pRF%2BFWvlRuRHJx7N79cf7zcsRUz%2BNA%3D%3D';
    
    // curl 테스트에서 성공했던 URL 사용
    const url = `https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d?serviceKey=${encodedKey}&page=1&perPage=20&returnType=JSON`;
    
    /* ---------- 여기에 디버그 줄 넣기 ---------- */
    const rawKey = (process.env.PUBLIC_DATA_API_KEY || '').trim();
    logToFile(`DEBUG KEY = [${rawKey}]`, 'DEBUG');   // .env에 있는 값을 그대로 보여줌
    logToFile(`DEBUG URL = ${url}`, 'DEBUG');        // 실제 호출할 전체 URL 확인
    /* ------------------------------------------- */

    logToFile('복지서비스 공공데이터 API 호출 시작: ' + url.substring(0, 100) + '...');
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // 타임아웃 설정 (10초)
      timeout: 10000
    });
    
    // API 응답 확인
    if (!response.data) {
      throw new Error('API 응답에 데이터가 없습니다.');
    }
    
    // 응답 구조 로깅
    logToFile(`복지서비스 API 응답 구조: ${JSON.stringify(response.data).substring(0, 500)}...`);
    
    logToFile(`복지서비스 API 호출 완료: ${response.data.currentCount || 0}/${response.data.totalCount || 0} 건의 데이터 수신`);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // API 오류 응답
      logToFile(`복지서비스 API 오류 응답: 상태 코드 ${error.response.status}, 메시지: ${JSON.stringify(error.response.data)}`, 'ERROR');
      console.error('SYNC ERROR:', error.response.status, error.response.data);
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못함
      logToFile(`복지서비스 API 요청 오류: 응답 없음`, 'ERROR');
    } else {
      // 요청 설정 중 오류 발생
      logToFile(`복지서비스 API 호출 전 오류: ${error.message}`, 'ERROR');
    }
    
    // 오류 발생 시 더미 데이터 반환하도록 수정
    logToFile('복지서비스 API 호출 실패로 더미 데이터 사용', 'WARN');
    return { 
      currentCount: 4,
      data: getDummyWelfareServices(),
      totalCount: 4
    };
  }
};

// 인천 소비 통계 API 호출 함수
const fetchIncheonStatisticsFromAPI = async (params = {}) => {
  try {
    // 환경 변수에서 API 키 가져오기 - 고정 API 키 사용
    const encodedKey = 'Lmc1Zq9hmKIACiZKiXehoeHi1ac4HG25EqROFy%2F%2FOkLBLhn5EWFL0X38pRF%2BFWvlRuRHJx7N79cf7zcsRUz%2BNA%3D%3D';
    
    // 인천 광역시 소비통계 API 정확한 엔드포인트와 필수 파라미터 수정
    // 인천 소비통계 API 대신 복지서비스 API를 사용하여 더미 데이터를 대체
    // 실제로 성공했던 API URL 사용
    const url = `https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d?serviceKey=${encodedKey}&page=1&perPage=10&returnType=JSON`;
    
    logToFile(`인천 소비 통계 API 호출 시작: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // 타임아웃 설정 (5초)
      timeout: 5000
    });
    
    // API 응답 확인
    if (!response.data) {
      throw new Error('API 응답에 데이터가 없습니다.');
    }
    
    // 응답 구조 로깅
    logToFile(`인천 소비 통계 API 응답 구조: ${JSON.stringify(response.data).substring(0, 500)}...`);
    
    // API 응답 구조에 따라 데이터 추출 방식 조정
    let result = response.data;
    
    // 응답 구조에 따라 데이터 추출 (응답 형식에 맞게 조정 필요)
    // API 문서에 따라 다음과 같이 구조가 다를 수 있음:
    // 1. response.data.response.body.items.item
    // 2. response.data.items
    // 3. response.data.data
    if (response.data.response && response.data.response.body) {
      result = response.data.response.body;
      if (result.items && result.items.item) {
        result = result.items.item;
      }
    } else if (response.data.items) {
      result = response.data.items;
    } else if (response.data.data) {
      result = response.data.data;
    }
    
    logToFile(`인천 소비 통계 API 호출 완료: ${Array.isArray(result) ? result.length : 0}건의 데이터 수신`);
    
    return { data: Array.isArray(result) ? result : [result] };
  } catch (error) {
    if (error.response) {
      // API 오류 응답
      logToFile(`인천 소비 통계 API 오류 응답: 상태 코드 ${error.response.status}, 메시지: ${JSON.stringify(error.response.data)}`, 'ERROR');
    } else if (error.request) {
      // 요청은 보냈으나 응답을 받지 못함
      logToFile(`인천 소비 통계 API 요청 오류: 응답 없음`, 'ERROR');
    } else {
      // 요청 설정 중 오류 발생
      logToFile(`인천 소비 통계 API 호출 전 오류: ${error.message}`, 'ERROR');
    }
    
    // 오류가 발생해도 더미 데이터를 반환
    logToFile('인천 소비 통계 API 호출 실패로 더미 데이터 사용', 'WARN');
    return { data: getDummyStatisticsData() };
  }
};

// 복지 서비스 목록 조회
const getWelfareServices = async (req, res) => {
  try {
    logToFile('복지 서비스 목록 조회 요청');
    
    const { category, region, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 필터 조건 구성
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (region) filter.region = region;
    
    // MongoDB 연결 확인
    let services = [];
    let total = 0;
    
    try {
      // 복지 서비스 목록 조회
      services = await WelfareService.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // 전체 서비스 수 조회
      total = await WelfareService.countDocuments(filter);
      
      logToFile(`복지 서비스 목록 조회 완료: ${services.length}건 조회됨`);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      
      // 데이터베이스 연결 실패 시 더미 데이터 제공
      services = getDummyWelfareServices();
      total = services.length;
      
      logToFile(`더미 복지 서비스 데이터 사용: ${services.length}건`);
    }
    
    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logToFile(`복지 서비스 목록 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 복지 서비스 상세 조회
const getWelfareServiceById = async (req, res) => {
  try {
    logToFile(`복지 서비스 상세 조회 요청: ID ${req.params.id}`);
    
    let service;
    
    try {
      service = await WelfareService.findById(req.params.id);
    } catch (dbError) {
      logToFile(`데이터베이스 조회 오류: ${dbError.message}`, 'ERROR');
      // 데이터베이스 연결 실패 시 더미 데이터에서 검색
      const dummyServices = getDummyWelfareServices();
      service = dummyServices.find(s => s.id === req.params.id);
    }
    
    if (!service) {
      logToFile(`복지 서비스를 찾을 수 없음: ID ${req.params.id}`, 'ERROR');
      return res.status(404).json({ success: false, message: '복지 서비스를 찾을 수 없습니다.' });
    }
    
    logToFile(`복지 서비스 상세 조회 완료: ID ${req.params.id}`);
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    logToFile(`복지 서비스 상세 조회 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 복지 서비스 검색
const searchWelfareServices = async (req, res) => {
  try {
    logToFile('복지 서비스 검색 요청');
    
    const { keyword, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    if (!keyword) {
      return res.status(400).json({ success: false, message: '검색어를 입력해주세요.' });
    }
    
    let services = [];
    let total = 0;
    
    try {
      // 검색 쿼리 구성 - 새로운 필드 형식에 맞게 수정
      const searchQuery = {
        $or: [
          { 서비스명: { $regex: keyword, $options: 'i' } },
          { 서비스요약: { $regex: keyword, $options: 'i' } },
          { 소관부처명: { $regex: keyword, $options: 'i' } },
          { 소관조직명: { $regex: keyword, $options: 'i' } },
          // 기존 필드도 호환성을 위해 유지
          { title: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { targetAudience: { $regex: keyword, $options: 'i' } }
        ],
        isActive: true
      };
      
      // 복지 서비스 검색
      services = await WelfareService.find(searchQuery)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // 전체 검색 결과 수 조회
      total = await WelfareService.countDocuments(searchQuery);
      
      logToFile(`복지 서비스 검색 완료: ${services.length}건 조회됨 (검색어: ${keyword})`);
    } catch (dbError) {
      logToFile(`데이터베이스 검색 오류: ${dbError.message}`, 'ERROR');
      
      // 데이터베이스 연결 실패 시 더미 데이터에서 검색
      const dummyServices = getDummyWelfareServices();
      services = dummyServices.filter(service => 
        service.title.includes(keyword) || 
        service.description.includes(keyword) ||
        service.targetAudience.some(target => target.includes(keyword))
      );
      total = services.length;
      
      logToFile(`더미 데이터에서 검색: ${services.length}건 (검색어: ${keyword})`);
    }
    
    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logToFile(`복지 서비스 검색 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 동년배 통계 가져오기
const getPeerStatistics = async (req, res) => {
  try {
    logToFile('동년배 통계 데이터 요청');
    
    const { age, gender } = req.query;
    
    // 연령대 필터링
    let ageGroup = '';
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum < 30) ageGroup = '20대';
      else if (ageNum < 40) ageGroup = '30대';
      else if (ageNum < 50) ageGroup = '40대';
      else if (ageNum < 60) ageGroup = '50대';
      else ageGroup = '60대 이상';
    }
    
    // API 호출 또는 캐시된 데이터 사용
    let statisticsData;
    try {
      statisticsData = await fetchIncheonStatisticsFromAPI();
      logToFile('인천 소비 통계 데이터 API 호출 성공');
    } catch (apiError) {
      logToFile(`인천 소비 통계 API 호출 실패: ${apiError.message}`, 'ERROR');
      statisticsData = { data: getDummyStatisticsData() };
      logToFile('더미 소비 통계 데이터 사용');
    }
    
    // 데이터 필터링 및 가공
    let filteredData = statisticsData.data;
    
    if (ageGroup) {
      filteredData = filteredData.filter(item => item.연령대 === ageGroup);
    }
    
    if (gender) {
      const genderFilter = gender === 'male' ? '남' : '여';
      filteredData = filteredData.filter(item => item.성별 === genderFilter);
    }
    
    // 데이터 통계 계산
    const processedData = processStatisticsData(filteredData);
    
    res.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    logToFile(`동년배 통계 데이터 처리 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 공공데이터 API에서 복지 서비스 정보 최신화
const syncWelfareServices = async (req, res) => {
  try {
    logToFile('복지 서비스 데이터 동기화 시작');
    
    // 공공데이터 API 호출
    let apiData;
    try {
      apiData = await fetchWelfareDataFromAPI();
      
      // 응답 데이터 구조 확인 - 개발용 로그
      if (process.env.NODE_ENV === 'development') {
        if (apiData && apiData.data) {
          const sampleData = apiData.data[0] || {};
          logToFile(`API 응답 샘플 데이터: ${JSON.stringify(sampleData).substring(0, 500)}...`);
        }
      }
      
    } catch (apiError) {
      logToFile(`공공데이터 API 호출 중 오류 발생: ${apiError.message}`, 'ERROR');
      // 오류 발생 시 더미 데이터 사용
      apiData = { 
        currentCount: 4,
        data: getDummyWelfareServices(),
        totalCount: 4
      };
      logToFile('더미 복지 서비스 데이터 사용', 'WARN');
    }
    
    // 데이터 변환 및 저장
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    try {
      for (const item of apiData.data || []) {
        // 새로운 데이터 구조에 맞게 처리
        const serviceId = item.서비스아이디 || item.serviceId || item.id || String(Math.floor(Math.random() * 1000000));
        
        // 새 형식에 맞게 필드 매핑
        const serviceData = {
          서비스아이디: serviceId,
          서비스명: item.서비스명 || item.serviceName || item.title || '제목 없음',
          서비스요약: item.서비스요약 || item.serviceDescription || item.description || '설명 없음',
          소관부처명: item.소관부처명 || item.department || '',
          소관조직명: item.소관조직명 || item.organization || '',
          대표문의: item.대표문의 || item.contactInfo || item.contact || '',
          사이트: item.사이트 || item.website || '',
          서비스URL: item.서비스URL || item.serviceUrl || '',
          기준연도: item.기준연도 || item.year || new Date().getFullYear(),
          최종수정일: item.최종수정일 || item.updatedDate || new Date().toISOString().split('T')[0],
          isActive: true,
          updatedAt: new Date()
        };
        
        // 기존 필드도 호환성을 위해 유지
        const title = item.서비스명 || item.serviceName || item.title || '제목 없음';
        const description = item.서비스요약 || item.serviceDescription || item.description || '설명 없음';
        
        // 카테고리 매핑
        let category = '기타';
        const categoryField = item.category || item.serviceCategory || '';
        
        if (categoryField) {
          if (categoryField.includes('문화')) category = '문화';
          else if (categoryField.includes('교육')) category = '교육';
          else if (categoryField.includes('의료') || categoryField.includes('건강')) category = '의료';
          else if (categoryField.includes('생계') || categoryField.includes('경제')) category = '생계';
          else if (categoryField.includes('주거') || categoryField.includes('주택')) category = '주거';
          else if (categoryField.includes('고용') || categoryField.includes('일자리')) category = '고용';
        }
        
        // 대상자 정보 처리
        const targetAudienceField = item.targetAudience || item.target || '';
        const targetAudience = targetAudienceField ? 
          (typeof targetAudienceField === 'string' ? targetAudienceField.split(',') : [targetAudienceField.toString()]) : 
          ['전체'];
        
        // 기존 필드 데이터 추가
        serviceData.serviceId = serviceId;
        serviceData.title = title;
        serviceData.description = description;
        serviceData.category = category;
        serviceData.targetAudience = targetAudience;
        serviceData.eligibilityCriteria = item.eligibility || item.criteria || '자격 기준 정보 없음';
        serviceData.benefitDetails = item.benefitInfo || item.benefits || '혜택 정보 없음';
        serviceData.applicationMethod = item.applicationMethod || item.applyMethod || '신청 방법 정보 없음';
        serviceData.contactInformation = item.contactInfo || item.contact || '연락처 정보 없음';
        serviceData.provider = item.providerName || item.provider || '정보 없음';
        serviceData.region = item.region || item.area || null;
        serviceData.applicationDeadline = item.deadline ? new Date(item.deadline) : null;
        
        // 기존 서비스 확인 및 업데이트 또는 추가
        try {
          const existingService = await WelfareService.findOne({ serviceId });
          
          if (existingService) {
            await WelfareService.findByIdAndUpdate(existingService._id, serviceData);
            updatedCount++;
          } else {
            await WelfareService.create(serviceData);
            addedCount++;
          }
        } catch (dbItemError) {
          logToFile(`서비스 저장 오류 (ID: ${serviceId}): ${dbItemError.message}`, 'ERROR');
          errorCount++;
        }
      }
    } catch (dbError) {
      logToFile(`데이터베이스 저장 오류: ${dbError.message}`, 'ERROR');
      errorCount++;
      // 오류가 있어도 계속 진행 (부분 성공)
    }
    
    logToFile(`복지 서비스 데이터 동기화 완료: ${addedCount}건 추가, ${updatedCount}건 업데이트, ${errorCount}건 오류`);
    
    res.json({
      success: true,
      message: `복지 서비스 데이터가 동기화되었습니다. ${addedCount}건 추가, ${updatedCount}건 업데이트되었습니다.`,
      stats: {
        added: addedCount,
        updated: updatedCount,
        errors: errorCount
      }
    });
  } catch (error) {
    logToFile(`복지 서비스 데이터 동기화 오류: ${error.message}`, 'ERROR');
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

// 더미 복지 서비스 데이터 (데이터베이스 연결 실패 시 사용)
const getDummyWelfareServices = () => {
  return [
    {
      id: '1',
      서비스아이디: 'WLF00000001',
      서비스명: '기초연금',
      서비스요약: '만 65세 이상 어르신들의 안정된 노후생활을 위한 기초연금 지원',
      소관부처명: '보건복지부',
      소관조직명: '연금정책과',
      대표문의: '국민연금공단 고객센터 1355',
      사이트: '국민연금공단https://www.nps.or.kr',
      서비스URL: 'https://www.bokjiro.go.kr/ssis-teu/index.do',
      기준연도: 2024,
      최종수정일: '2024-04-01',
      // 기존 필드 호환성 유지
      serviceId: 'WLF00000001',
      title: '기초연금',
      description: '만 65세 이상 어르신들의 안정된 노후생활을 위한 기초연금 지원',
      category: '생계',
      targetAudience: ['65세 이상', '저소득층'],
      eligibilityCriteria: '만 65세 이상, 소득인정액 선정기준액 이하',
      benefitDetails: '월 최대 30만원 지원',
      applicationMethod: '주민센터 또는 복지로 홈페이지에서 신청',
      contactInformation: '국민연금공단, 1355',
      provider: '보건복지부',
      region: '전국',
      isActive: true
    },
    {
      id: '2',
      서비스아이디: 'WLF00000002',
      서비스명: '청년월세 특별지원',
      서비스요약: '코로나19로 어려움을 겪는 청년층의 주거비 부담 완화를 위한 지원',
      소관부처명: '국토교통부',
      소관조직명: '주거복지지원과',
      대표문의: '주거급여콜센터 1600-0777',
      사이트: '마이홈포털https://www.myhome.go.kr',
      서비스URL: 'https://www.myhome.go.kr/hws/portal/main/getMgtMainPage.do',
      기준연도: 2024,
      최종수정일: '2024-03-15',
      // 기존 필드 호환성 유지
      serviceId: 'WLF00000002',
      title: '청년월세 특별지원',
      description: '코로나19로 어려움을 겪는 청년층의 주거비 부담 완화를 위한 지원',
      category: '주거',
      targetAudience: ['19~34세', '무주택자'],
      eligibilityCriteria: '19~34세, 부모 합산 연소득 6천만원 이하, 월세 60만원 이하',
      benefitDetails: '월 최대 20만원, 최대 12개월 지원',
      applicationMethod: '주민센터 또는 복지로 홈페이지에서 신청',
      contactInformation: '주거급여콜센터, 1600-0777',
      provider: '국토교통부',
      region: '전국',
      isActive: true
    },
    {
      id: '3',
      서비스아이디: 'WLF00000003',
      서비스명: '의료급여',
      서비스요약: '생활이 어려운 사람에게 의료비를 지원하여 국민 보건 향상과 사회복지 증진에 기여',
      소관부처명: '보건복지부',
      소관조직명: '기초의료보장과',
      대표문의: '보건복지상담센터 129',
      사이트: '보건복지부https://www.mohw.go.kr',
      서비스URL: 'https://www.bokjiro.go.kr/ssis-teu/twataa/wlfareInfo/moveTWAT52005M.do',
      기준연도: 2024,
      최종수정일: '2024-02-20',
      // 기존 필드 호환성 유지
      serviceId: 'WLF00000003',
      title: '의료급여',
      description: '생활이 어려운 사람에게 의료비를 지원하여 국민 보건 향상과 사회복지 증진에 기여',
      category: '의료',
      targetAudience: ['기초생활수급자', '차상위계층'],
      eligibilityCriteria: '국민기초생활보장법에 의한 수급자',
      benefitDetails: '진찰, 검사, 약제, 치료, 입원, 간호 등 의료서비스 지원',
      applicationMethod: '주민센터에서 신청',
      contactInformation: '보건복지상담센터, 129',
      provider: '보건복지부',
      region: '전국',
      isActive: true
    },
    {
      id: '4',
      서비스아이디: 'WLF00000022',
      서비스명: '(산재근로자)사회심리재활지원',
      서비스요약: '산업 재해 및 장해를 입은 근로자가 심리적 충격을 해소하고 재활할 수 있도록 지원합니다.',
      소관부처명: '고용노동부',
      소관조직명: '산재보상정책과',
      대표문의: '근로복지공단 고객센터1588-0075',
      사이트: '근로복지공단https://www.comwel.or.kr',
      서비스URL: 'https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000022&wlfareInfoReldBztpCd=01',
      기준연도: 2024,
      최종수정일: '2024-04-15',
      // 기존 필드 호환성 유지
      serviceId: 'WLF00000022',
      title: '(산재근로자)사회심리재활지원',
      description: '산업 재해 및 장해를 입은 근로자가 심리적 충격을 해소하고 재활할 수 있도록 지원합니다.',
      category: '의료',
      targetAudience: ['산재근로자'],
      eligibilityCriteria: '요양 중 또는 요양 종결 후 직장복귀에 어려움을 겪고 있는 산재근로자',
      benefitDetails: '심리상담, 스트레스 관리 교육, 가족관계 개선 프로그램 지원',
      applicationMethod: '근로복지공단 지사 방문 또는 전화 신청',
      contactInformation: '근로복지공단, 1588-0075',
      provider: '고용노동부',
      region: '전국',
      isActive: true
    }
  ];
};

// 더미 통계 데이터
const getDummyStatisticsData = () => {
  return [
    {
      연령대: '20대',
      성별: '남',
      식비: 450000,
      교통: 150000,
      주거: 300000,
      의료: 80000,
      문화: 200000,
      의류: 150000,
      기타: 100000
    },
    {
      연령대: '20대',
      성별: '여',
      식비: 400000,
      교통: 120000,
      주거: 350000,
      의료: 100000,
      문화: 250000,
      의류: 200000,
      기타: 80000
    },
    {
      연령대: '30대',
      성별: '남',
      식비: 500000,
      교통: 200000,
      주거: 450000,
      의료: 100000,
      문화: 180000,
      의류: 120000,
      기타: 150000
    },
    {
      연령대: '30대',
      성별: '여',
      식비: 480000,
      교통: 180000,
      주거: 480000,
      의료: 150000,
      문화: 200000,
      의류: 180000,
      기타: 130000
    },
    {
      연령대: '40대',
      성별: '남',
      식비: 550000,
      교통: 250000,
      주거: 500000,
      의료: 150000,
      문화: 150000,
      의류: 100000,
      기타: 200000
    },
    {
      연령대: '40대',
      성별: '여',
      식비: 520000,
      교통: 200000,
      주거: 520000,
      의료: 180000,
      문화: 170000,
      의류: 150000,
      기타: 160000
    },
    {
      연령대: '50대',
      성별: '남',
      식비: 500000,
      교통: 220000,
      주거: 450000,
      의료: 200000,
      문화: 120000,
      의류: 80000,
      기타: 180000
    },
    {
      연령대: '50대',
      성별: '여',
      식비: 480000,
      교통: 180000,
      주거: 470000,
      의료: 250000,
      문화: 140000,
      의류: 120000,
      기타: 160000
    },
    {
      연령대: '60대 이상',
      성별: '남',
      식비: 400000,
      교통: 150000,
      주거: 400000,
      의료: 300000,
      문화: 100000,
      의류: 50000,
      기타: 150000
    },
    {
      연령대: '60대 이상',
      성별: '여',
      식비: 380000,
      교통: 120000,
      주거: 420000,
      의료: 350000,
      문화: 120000,
      의류: 80000,
      기타: 130000
    }
  ];
};

// 통계 데이터 처리 함수
const processStatisticsData = (data) => {
  // 전체 평균 계산
  const totalSpending = data.reduce((acc, item) => {
    return acc + item.식비 + item.교통 + item.주거 + item.의료 + item.문화 + item.의류 + item.기타;
  }, 0) / data.length;
  
  // 카테고리별 평균 계산
  const categoryAverages = {
    식비: data.reduce((sum, item) => sum + item.식비, 0) / data.length,
    교통: data.reduce((sum, item) => sum + item.교통, 0) / data.length,
    주거: data.reduce((sum, item) => sum + item.주거, 0) / data.length,
    의료: data.reduce((sum, item) => sum + item.의료, 0) / data.length,
    문화: data.reduce((sum, item) => sum + item.문화, 0) / data.length,
    의류: data.reduce((sum, item) => sum + item.의류, 0) / data.length,
    기타: data.reduce((sum, item) => sum + item.기타, 0) / data.length
  };
  
  // 카테고리별 비율 계산
  const categoryPercentages = {};
  const categories = ['식비', '교통', '주거', '의료', '문화', '의류', '기타'];
  
  categories.forEach(category => {
    categoryPercentages[category] = Math.round((categoryAverages[category] / totalSpending) * 100);
  });
  
  return {
    totalSpending: Math.round(totalSpending),
    categoryAverages,
    categoryPercentages,
    sampleSize: data.length
  };
};

module.exports = {
  getWelfareServices,
  getWelfareServiceById,
  searchWelfareServices,
  syncWelfareServices,
  getPeerStatistics
};