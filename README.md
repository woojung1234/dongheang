# 동행 금융 복지 지원 플랫폼

## 프로젝트 개요
'동행'은 대화형 금융 복지 지원 플랫폼으로, 고령자와 취약계층을 위한 사용자 친화적 UI/UX를 제공하며, AI 챗봇 '금복이'를 통해 복지 서비스 검색 및 금융 기능을 쉽게 이용할 수 있게 합니다.

## 주요 기능
1. AI 챗봇 '금복이' 시스템
2. 공공데이터 연동 복지 서비스 안내
3. 월별·카테고리별 소비 내역 및 리포트 시각화
4. 동년배 비교 분석 시스템
5. 고령자·취약계층 친화적 UI/UX 설계

## 구현된 API 목록
- GET /api/welfare - 복지 서비스 목록 조회
- GET /api/welfare/search - 복지 서비스 검색
- GET /api/welfare/:id - 복지 서비스 상세 조회
- GET /api/welfare/peer-statistics - 동년배 통계 데이터 조회
- GET /api/spending - 소비 내역 목록 조회
- GET /api/spending/stats/gender - 소비 성별 통계 조회
- POST /api/auth/dev-login - 개발용 로그인
- GET /api/auth/check - 로그인 상태 확인
- POST /api/auth/logout - 로그아웃
- GET /api/users/profile - 사용자 프로필 조회
- PUT /api/users/profile - 사용자 프로필 업데이트
- POST /api/welfare/sync - 복지 서비스 데이터 동기화
- GET /api/spending/stats/age - 소비 연령별 통계
- GET /api/spending/stats/category - 소비 업종별 통계
- GET /api/spending/dashboard - 소비 대시보드 통계
- POST /api/chatbot/message - 챗봇 메시지 전송
- GET /api/spending/comparison - 소비 동년배 비교
- GET /api/chatbot/history - 챗봇 대화 내역 조회
- POST /api/auth/login - 일반 로그인
- POST /api/auth/register - 회원가입

## 기술 스택
- 프론트엔드: React, Bootstrap, Chart.js
- 백엔드: Node.js, Express
- 데이터베이스: MongoDB
- 인증: JWT
- 기타: Socket.IO, Swagger(API 문서화)

## 설치 및 실행 방법

### 개발 환경 준비
1. Node.js(v14 이상) 설치
2. MongoDB 설치 또는 Docker로 실행
3. .env 파일 설정

### 서버 설치 및 실행
```bash
# 저장소 클론
git clone https://github.com/yourusername/dongheang.git
cd dongheang

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 프론트엔드 설치 및 실행
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm start
```

## Docker 환경에서 실행
```bash
# Docker Compose로 모든 서비스 실행
docker-compose up -d

# 컨테이너 실행 상태 확인
docker ps
```

## 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongo-db:27017/dongheang
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
OPENAI_API_KEY=your_openai_api_key
```

## 기존 이슈 해결 내역

1. **kakaoId 인덱스 충돌 해결**
   - MongoDB에서 kakaoId_1 인덱스 제거
   - User 모델에서 kakaoId 필드 인덱스 설정 변경
   - 회원가입 로직에서 kakaoId 관련 코드 제거

2. **공공데이터 API 연동 문제 해결**
   - 새로운 API 엔드포인트 적용
   - 더미 데이터 폴백 메커니즘 구현

## 프로젝트 구조
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
└── scripts/            # 유틸리티 스크립트
```

## 테스트 계정
- 이메일: example@example.com
- 비밀번호: testpassword