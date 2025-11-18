# 🎬 OTT Friends - AI 영화 추천 챗봇

> **"왜 첫인상이 중요할까?"** - AI가 당신의 취향을 이해하고 완벽한 영화를 추천해드립니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org/)

---

## 🌟 주요 기능

### 1️⃣ AI 챗봇 추천 시스템
- **Google Gemini 2.0 Flash** 기반 자연어 대화
- **페르소나 선택**: 다정한 친구 vs 츤데레 친구
- **TPO 분석**: 사용자의 감정, 상황, 의도 파악
- **스마트 셔플**: 평점 높은 순 + 랜덤 조합

### 2️⃣ Discovery Feed (발견 피드)
- 🔥 **지금 한국에서 가장 핫한 10편** (TMDB Trending)
- ✨ **곧 개봉하는 주목할 영화** (TMDB Upcoming)
- 📊 **6시간 캐싱 시스템** (99.9% API 비용 절감)

### 3️⃣ 영화 상세 정보
- **AI 한 줄 평**: Gemini가 생성한 핵심 요약
- **글로벌 리뷰 번역**: TMDB 리뷰를 한국어로 자동 번역
- **OTT 플랫폼 정보**: 넷플릭스, 디즈니+, 왓챠 등 시청 가능 플랫폼
- **출연진 정보**: 배우 사진, 역할 정보
- **프렌즈 평점**: 1-10 점수 입력 + 텍스트 후기

### 4️⃣ OTT 필터링
- Netflix, Disney+, Amazon Prime, Watcha, Wavve, Tving 지원
- 내가 구독한 플랫폼의 영화만 추천

### 5️⃣ 이미 본 작품 관리
- "이미 봄" 리스트로 중복 추천 방지
- 찜 목록으로 나중에 볼 영화 저장

---

## 🚀 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **shadcn/ui** (Radix UI 기반 디자인 시스템)
- **TailwindCSS** (Cozy Night Mode 커스텀 테마)
- **Vite** (빌드 도구)

### Backend
- **Express.js** (Node.js 서버)
- **Google Gemini 2.0 Flash** (AI 엔진)
- **TMDB API** (영화 데이터)
- **Supabase PostgreSQL** (캐싱 + 데이터베이스)

### 주요 라이브러리
- `@google/generative-ai` - Gemini AI SDK
- `@supabase/supabase-js` - Supabase 클라이언트
- `lucide-react` - 아이콘 시스템
- `react-hook-form` - 폼 관리
- `sonner` - 토스트 알림

---

## 📦 설치 및 실행

### 1. Prerequisites (필수 요구사항)

- **Node.js v18+**
- **npm** or **yarn**
- **API 키** 발급 필요:
  - [Google Gemini API](https://aistudio.google.com/app/apikey)
  - [TMDB API](https://www.themoviedb.org/settings/api)
  - [Supabase 프로젝트](https://app.supabase.com)

### 2. 프로젝트 클론

```bash
git clone https://github.com/wheemin1/ottfriends.git
cd ottfriends
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 실제 API 키 입력:

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Supabase 데이터베이스 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. **SQL Editor** 열기
3. `supabase_schema.sql` 파일 내용 복사 & 실행

### 6. 개발 서버 실행

```bash
npm run dev
```

서버 주소: `http://localhost:3000`

---

## 📁 프로젝트 구조

```
ottfriends/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # UI 컴포넌트
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── DiscoveryFeed.tsx
│   │   │   ├── DetailsPanel.tsx
│   │   │   ├── OTTPlatforms.tsx
│   │   │   └── ui/        # shadcn/ui 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   └── lib/           # 유틸리티 함수
│   └── index.html
│
├── server/                # Express 백엔드
│   ├── lib/
│   │   ├── gemini.ts     # Gemini AI 통합
│   │   ├── tmdb.ts       # TMDB API 통합
│   │   └── supabase.ts   # Supabase 캐싱
│   ├── routes.ts         # API 라우트
│   └── index.ts          # 서버 진입점
│
├── shared/               # 공유 타입 정의
│   └── schema.ts
│
├── supabase_schema.sql  # DB 스키마
├── .env.example         # 환경 변수 템플릿
├── package.json
└── README.md
```

---

## 🔐 보안 가이드

### ⚠️ 중요: API 키 보안

**절대 하지 말아야 할 것:**
- ❌ `.env` 파일을 Git에 커밋
- ❌ API 키를 코드에 하드코딩
- ❌ Supabase Service Role Key를 클라이언트에서 사용
- ❌ 공개 저장소에 실제 키 업로드

**반드시 해야 할 것:**
- ✅ `.env` 파일을 `.gitignore`에 추가 (이미 포함됨)
- ✅ 환경 변수로 모든 민감 정보 관리
- ✅ Service Role Key는 서버에서만 사용
- ✅ 정기적으로 API 키 갱신

### 환경 변수 관리

```bash
# .env 파일은 Git에 포함되지 않습니다
.env          # ← 실제 키 (절대 커밋 금지!)
.env.example  # ← 템플릿만 (커밋 가능)
```

### Supabase Row Level Security (RLS)

모든 테이블에 RLS 정책 적용됨:
- `dynamic_cache`: 읽기(모두), 쓰기(서버만)
- `cached_data`: 읽기(모두), 쓰기(서버만)
- `comments`: 로그인 사용자만 읽기/쓰기

---

## 🎨 디자인 시스템

### Cozy Night Mode 테마
- **기본 배경**: `#0a0a0a` (거의 검정)
- **카드 배경**: `#1a1a1a` (어두운 회색)
- **강조색**: `#6366f1` (인디고 블루)
- **폰트**: Pretendard (한글 최적화)

### 주요 컴포넌트
- **ChatBubble**: 사용자/AI 메시지 버블
- **MoviePoster**: 호버 효과 포함 포스터 카드
- **PersonaSelector**: 페르소나 선택 토글
- **OTTFilter**: 체크박스 기반 필터

---

## 🚀 배포 가이드

### Vercel 배포 (권장)

1. GitHub 저장소 연동
2. 환경 변수 설정 (Vercel Dashboard)
3. 빌드 설정:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### 환경 변수 설정 (Vercel)

Vercel Dashboard > Settings > Environment Variables에서 추가:
- `GEMINI_API_KEY`
- `TMDB_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📊 성능 최적화

### v3.35 동적 캐싱 시스템

#### API 호출 최적화
- **이전**: 사용자당 2회 TMDB API 호출
- **현재**: 6시간당 2회만 호출 (모든 사용자 공유)
- **절감율**: 99.9%

#### 응답 속도
- **Cache HIT**: ~200ms (Supabase 조회)
- **Cache MISS**: ~2s (TMDB 호출 + 캐싱)
- **평균**: 10배 속도 향상

#### 비용 절감 (월 10만 사용자 기준)
- **이전**: 6,000,000 API 호출/월
- **현재**: 240 API 호출/월
- **절감액**: 약 $50~100/월

---

## 🗺️ 로드맵

### ✅ 완료된 기능
- [x] AI 챗봇 추천 엔진 (v3.7)
- [x] Supabase 정적 캐싱 (v3.9)
- [x] 동적 캐싱 시스템 (v3.35)
- [x] OTT 플랫폼 필터 (v3.1)
- [x] 프렌즈 평점 UI (v3.37)
- [x] Discovery Feed (v3.26)

### 🚧 진행 중
- [ ] 백엔드 평점 저장 (Supabase)
- [ ] 백엔드 후기 저장 (Supabase)
- [ ] 캐시 자동 정리 (Cron Job)

### 📅 계획 중 (v4.0+)
- [ ] 소셜 로그인 (v4.1 Lazy Login)
  - 카카오, 구글, 네이버 로그인
  - NextAuth.js 통합
- [ ] 프리미엄 구독 (v4.2)
  - 무제한 추천 (무료: 10회/일)
  - 광고 제거
  - 토스페이먼츠 결제
- [ ] 친구 시스템 (v4.3)
  - 친구 추가/관리
  - 친구 추천 영화 보기
  - 단체 채팅방

---

## 🤝 기여 가이드

### 버그 리포트
Issues 탭에서 버그 리포트 작성:
- 재현 방법
- 예상 동작 vs 실제 동작
- 스크린샷 (가능한 경우)

### Pull Request
1. Fork 저장소
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 코딩 스타일
- TypeScript strict mode
- Prettier 포맷팅
- ESLint 규칙 준수
- 컴포넌트: PascalCase
- 함수: camelCase

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 📞 문의

- **개발자**: wheemin1
- **저장소**: [github.com/wheemin1/ottfriends](https://github.com/wheemin1/ottfriends)
- **이슈 트래커**: [GitHub Issues](https://github.com/wheemin1/ottfriends/issues)

---

## 🙏 감사의 말

- **TMDB**: 영화 데이터 제공
- **Google Gemini**: AI 엔진 제공
- **Supabase**: 데이터베이스 및 캐싱
- **shadcn/ui**: 디자인 시스템
- **Vercel**: 호스팅 플랫폼

---

**Made with ❤️ by wheemin1**
