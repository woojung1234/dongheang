# '동행' 금융 복지 지원 플랫폼 개발 계획

## 프로젝트 개요
'동행'은 대화형 금융 복지 지원 플랫폼으로, 리액트 네이티브를 기반으로 개발됩니다. 고령자와 취약계층을 위한 사용자 친화적 UI/UX를 제공하며, AI 챗봇 '금복이'를 통해 복지 서비스 검색 및 금융 기능을 쉽게 이용할 수 있게 합니다. 동년배 소비 통계 비교, 소비 예측, 맞춤형 예산 추천 등 실질적 재정관리를 지원하는 기능을 포함합니다.

## 핵심 기능
1. 카카오 OAuth 기반 간편 로그인 시스템
2. AI 챗봇 '금복이' 시스템
3. 공공데이터 연동 복지 서비스 안내
4. 월별·카테고리별 소비 내역 및 리포트 시각화
5. 동년배 비교 분석 시스템
6. 고령자·취약계층 친화적 UI/UX 설계

## 기술 스택
- 프론트엔드: React Native, Recoil, Chart.js
- 백엔드: Node.js, Express
- 데이터베이스: MongoDB
- 인증: Passport-Kakao, JWT
- API: OpenAI GPT, 공공데이터포털 API
- 기타: Socket.IO, Redis, React Query

## 디렉토리 구조
```
/mysite
├── config/             # 환경 설정 파일
├── controllers/        # API 컨트롤러
├── docs/               # 프로젝트 문서
├── frontend/           # 리액트 앱
│   ├── public/
│   └── src/
│       ├── components/ # UI 컴포넌트
│       ├── context/    # 컨텍스트 API
│       ├── hooks/      # 커스텀 훅
│       ├── pages/      # 페이지 컴포넌트
│       └── services/   # API 서비스
├── logs/               # 로그 파일
├── middleware/         # 미들웨어
├── models/             # 데이터 모델
├── routes/             # API 라우트
└── utils/              # 유틸리티 함수
```

## 현재 진행 상황 (2025-04-23)
- 공공데이터 API 연동 오류 해결을 위한 작업:
  - API 키 수정: 새로운 API 키 적용 (Lmc1Zq9hmKIACiZKiXehoeHi1ac4HG25EqROFy//OkLBLhn5EWFL0X38pRF+FWvlRuRHJx7N79cf7zcsRUz+NA==)
  - API 엔드포인트 테스트 및 수정 완료:
    - 복지서비스 API: https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d (테스트 확인 완료)
    - 인천광역시 소비통계 API: https://apis.data.go.kr/6280000/icfss/v1/getconsume (정확한 엔드포인트 확인 완료)
  - 요청 파라미터 정리: 
    - 복지서비스: returnType=JSON, page/perPage 지정
    - 인천소비통계: resultType=json, pageNo/numOfRows, bDate, cellType, sxT, ageT 지정
  - "등록되지 않은 서비스" 오류 발생 - URL 엔드포인트 문제
  - 데이터베이스 저장 연결 문제
  - MongoDB 스키마 구조 수정 완료:
    - 새로운 복지서비스 데이터 형식에 맞게 스키마 수정 (서비스아이디, 서비스명, 서비스요약 등)
    - 데이터 검색 쿼리 업데이트 (새로운 필드로 검색 가능)
    - 더미 데이터 형식 업데이트 (WLF00000022 산재근로자 사회심리재활지원 데이터 추가)
  
## 문제점 및 해결 방안
1. 공공데이터 API 서비스 문제
   - 원인: API 엔드포인트가 변경되었거나 서비스가 중단됨
   - 해결 방안: 더미 데이터로 대체하여 프론트엔드 기능 구현 완료 후 실제 데이터 연동을 위한 추가 작업 진행

2. 데이터 형식 변경 문제
   - 원인: 복지서비스 데이터 형식이 {서비스아이디, 서비스명, 서비스요약, 소관부처명 등} 형식으로 변경됨
   - 해결 방안: MongoDB 스키마 및 검색 쿼리 수정 완료, 호환성을 위해 기존 필드 유지

2. MongoDB 연결 문제
   - 원인: Docker에서 MongoDB 서비스가 실행되지 않거나 연결 설정 문제
   - 해결 방안: 로컬 개발 환경에서는 더미 데이터 사용 기능을 강화하여 작업 진행, Docker 환경에서 재구성 테스트 실시

## 다음 작업
1. 공공데이터 API 연동 문제 해결
   - API 키와 URL 엔드포인트 수정 완료
   - 인천 소비통계 API 대신 임시 더미 데이터 사용
   - 더미 데이터 연동이 잘 되도록 syncWelfareServices 함수 개선
   - MongoDB 스키마 구조 수정 완료:
     - WelfareService 모델에 새로운 필드 구조(서비스아이디, 서비스명, 서비스요약 등) 추가
     - 검색 쿼리 수정으로 새로운 필드 형식에 맞게 데이터 검색 가능
     - 호환성을 위해 기존 필드 유지

2. 데이터베이스 연결 문제 해결
   - Docker 기반 MongoDB 설정 점검 및 최적화
   - 로컬 테스트용 더미 데이터 사용 기능 개선
   - 오류 강전성을 위한 예외 처리 강화

2. 프론트엔드 및 백엔드 통합 테스트
   - 테스트 계정으로 로그인 테스트
   - 챗봇 기능 테스트
   - 소비 데이터 저장 및 조회 테스트

3. Docker 시스템 최종 점검
   - 모든 컨테이너 정상 작동 확인
   - 로그 충돌 및 오류 검사
   - 배포 준비 확인

## API 엔드포인트
### 인증 API
- POST /api/auth/kakao/callback - 카카오 로그인 콜백
- GET /api/auth/check - 로그인 상태 확인
- POST /api/auth/logout - 로그아웃
- POST /api/auth/dev-login - 개발용 임시 로그인

### 사용자 API
- GET /api/users/profile - 사용자 프로필 조회
- PUT /api/users/profile - 사용자 프로필 업데이트

### 복지 서비스 API
- GET /api/welfare - 복지 서비스 목록 조회
- GET /api/welfare/search - 복지 서비스 검색
- GET /api/welfare/:id - 복지 서비스 상세 조회
- POST /api/welfare/sync - 공공데이터 API 동기화

### 소비 내역 API
- POST /api/spending - 소비 내역 추가
- GET /api/spending - 소비 내역 목록 조회
- GET /api/spending/:id - 특정 소비 내역 조회
- PUT /api/spending/:id - 소비 내역 수정
- DELETE /api/spending/:id - 소비 내역 삭제
- GET /api/spending/stats/monthly - 월별 소비 통계
- GET /api/spending/stats/comparison - 동년배 비교 통계
- GET /api/spending/stats/prediction - 소비 예측 분석
- GET /api/spending/budget/recommendation - 추천 예산 계획

### 챗봇 API
- POST /api/chatbot/message - 챗봇 메시지 전송
- GET /api/chatbot/history - 대화 내역 조회
- GET /api/chatbot/sessions - 대화 세션 목록 조회

## API 인증 키 및 엔드포인트
- 공공데이터 API 키 (URL 인코딩): Lmc1Zq9hmKIACiZKiXehoeHi1ac4HG25EqROFy%2F%2FOkLBLhn5EWFL0X38pRF%2BFWvlRuRHJx7N79cf7zcsRUz%2BNA%3D%3D
- 공공데이터 API 키 (URL 디코딩): Lmc1Zq9hmKIACiZKiXehoeHi1ac4HG25EqROFy//OkLBLhn5EWFL0X38pRF+FWvlRuRHJx7N79cf7zcsRUz+NA==

### API 엔드포인트 정보
1. **복지서비스 정보 API**
   - Base URL: api.odcloud.kr/api
   - 엔드포인트: 15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d 
   - 전체 URL: https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d
   - 파라미터: serviceKey, returnType=JSON, page=1, perPage=20

2. **인천광역시 소비통계 API**
   - Base URL: apis.data.go.kr
   - 엔드포인트: /6280000/icfss/v1/getconsume
   - 전체 URL: https://apis.data.go.kr/6280000/icfss/v1/getconsume
   - 데이터포맷: JSON+XML
   - 파라미터: serviceKey, resultType=json, pageNo=1, numOfRows=10, bDate=202401, cellType=100, sxT=0, ageT=00

## 테스트 결과 (2025-04-23)
1. 서버 연결 테스트
   - 백엔드 서버(포트 5000)가 정상적으로 실행됨
   - API 엔드포인트들이 대체로 정상 동작함
   - MongoDB 연결이 정상적으로 구성됨

2. 발견된 문제점
   - Docker 연결 문제: 로컬 시스템의 Docker Desktop 실행이 필요함
   - 프론트엔드 실행 문제: node-app과 포트 충돌이 발생함
   - 공공데이터 API 연동 오류: "등록되지 않은 서비스" 응답 발생
   - API 엔드포인트 오류: 잘못된 엔드포인트 사용 (Swagger 문서를 통해 정확한 엔드포인트 확인 필요)
   - API 파라미터 문제: 각 API에 맞는 정확한 파라미터 형식 필요 (returnType vs type 등)

3. 해결 방안
   - Docker 설정 최적화: nginx 설정 추가 및 포트 설정 변경
   - MongoDB 연결 설정 수정: Docker 환경과 로컬 환경에 따라 다른 설정 적용
   - 개발 환경 분리: 프론트엔드 개발은 별도 포트에서 진행

## 다음 작업 계획
1. 서버 및 데이터베이스 연결 오류 해결
   - MongoDB 연결 설정 개선
   - 로컬 개발 환경과 Docker 환경 정리

2. 공공데이터 API 연동 문제 해결
   - 복지서비스 API 테스트 추가: curl 명령어로 확인한 정상 작동 확인
     - 엔드포인트 https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d 적용 완료 
   - 인천광역시 소비통계 API 엔드포인트 적용
     - https://apis.data.go.kr/6280000/icfss/v1/getconsume 엔드포인트 및 추가 파라미터 적용
     - 필수 파라미터 (resultType, bDate, cellType, sxT, ageT) 추가
   - API 정상 호출 테스트 진행 및 확인
   - 데이터 가공 로직 점검 및 예외 처리 강화

3. 프론트엔드 및 백엔드 연동 테스트
   - 로그인 기능 테스트
   - 소비 데이터 저장 및 불러오기 테스트
   - 사용자 인터페이스 기능 검증

4. 도커 컨테이너 구성 최적화
   - nginx 설정 완료
   - 컨테이너 간 통신 설정 완료
   - 서버 배포 구성 준비

## 테스트 계정
- 이메일: example@example.com
- 비밀번호: testpassword
