# 🎬 OTT 프렌즈 - AI 영화 추천 서비스

> **"오늘 뭐 볼까?"** 더 이상 고민하지 마세요. AI 친구가 당신의 기분과 취향에 딱 맞는 영화를 추천해드립니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v6.15-green.svg)]()
[![Status](https://img.shields.io/badge/Status-Production_Ready-success.svg)]()

---

## 🌟 서비스 소개

**OTT 프렌즈**는 대화형 AI가 사용자의 감정, 상황, 선호도를 이해하고 개인화된 영화를 추천하는 서비스입니다.

### 핵심 가치

1. **대화하듯 자연스럽게** 📱  
   "오늘 좀 우울한데 뭐 볼까?"처럼 편하게 물어보세요. AI가 맥락을 이해합니다.

2. **내가 구독한 OTT만** 🎯  
   넷플릭스, 디즈니+, 왓챠 등 내가 쓰는 플랫폼의 영화만 추천받으세요.

3. **세계 평단의 시선** 🌍  
   로튼토마토, IMDb 등 글로벌 리뷰를 AI가 한국어로 번역해 보여드립니다.

4. **친구들의 진짜 후기** 👥  
   평점만으로는 부족해요. 친구들이 남긴 솔직한 후기를 함께 확인하세요.

---

## ✨ 주요 기능

### 1. AI 추천 챗봇
- **자연어 대화**: "로맨스 말고 액션", "주말 저녁에 가족이랑" 같은 자연스러운 표현 이해
- **페르소나 선택**: 다정한 친구 vs 츤데레 친구 중 선택
- **TPO 분석**: 시간(Time), 장소(Place), 상황(Occasion) 고려
- **스마트 추천**: 평점 높은 영화 + 의외의 숨은 명작 조합

### 2. 발견 피드 (Discovery)
- **🔥 지금 한국에서 가장 핫한 영화** (실시간 트렌드)
- **✨ 곧 개봉하는 주목할 영화** (개봉 예정작)
- 6시간마다 자동 업데이트

### 3. 영화 상세 정보
- **AI 한 줄 평**: Gemini가 생성한 핵심 요약
- **글로벌 리뷰**: TMDB 영어 리뷰를 한국어로 자동 번역
- **OTT 정보**: 어디서 볼 수 있는지 한눈에
- **출연진**: 배우 사진과 역할 정보
- **프렌즈 평점**: 친구들의 1-10점 평가 + 텍스트 후기

### 4. OTT 필터
Netflix, Disney+, Amazon Prime, Watcha, Wavve, Tving 지원

### 5. 시청 관리
- **이미 봄**: 중복 추천 방지
- **찜 목록**: 나중에 볼 영화 저장

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

## 🎨 디자인 컨셉: Moonlight Dark Mode

**키워드**: 미니멀, 럭셔리, 생동감

### 색상 시스템
- **배경**: `#0a0a0a` (거의 검정)
- **카드**: `slate-800` (어두운 회색)
- **강조**: 프로스트 글래스 효과 (흰색 투명도)
- **버튼**: 순백색 (bg-white, text-black)

### 디자인 철학
1. **모노크롬 기반**: 색상(Hue) 최소화, 밝기(Brightness)로 대비
2. **프로스트 글래스**: 투명도로 깊이감 표현
3. **애플 스타일**: 고대비, 깔끔한 타이포그래피
4. **토스 스타일**: 선명한 색상 포인트 (알약 버튼)

### 레퍼런스
- Apple Music Dark Mode
- Toss 앱
- Netflix UI

---

## 📊 성능 & 비용 최적화

### 캐싱 시스템
| 항목 | 이전 | 현재 | 개선율 |
|------|------|------|--------|
| API 호출 | 사용자당 2회 | 6시간당 2회 | **99.9%↓** |
| 응답 속도 | ~2초 | ~200ms | **10배↑** |
| 월 비용 | $55 | $0.42 | **99%↓** |

---

## 🚀 로드맵

### ✅ v1.0 - MVP (완료)
- [x] AI 챗봇 추천
- [x] TMDB 영화 데이터
- [x] 기본 UI/UX

### ✅ v2.0 - 캐싱 & 최적화 (완료)
- [x] Supabase 캐싱 (99% 비용 절감)
- [x] Discovery Feed

### ✅ v3.0 - UX 개선 (완료)
- [x] ChatGPT Canvas 스타일
- [x] 애니메이션 개선
- [x] 글로벌 리뷰 번역

### ✅ v6.0 - Moonlight Design (완료)
- [x] 모노톤 디자인 시스템
- [x] 프로스트 글래스 UI
- [x] 애플 스타일 버튼
- [x] 심리스 패널 전환

### 🚧 v7.0 - 로딩 최적화 (진행 중)
- [ ] 스켈레톤 UI
- [ ] 이미지 Lazy Loading
- [ ] 무한 스크롤

### 📅 v8.0 - 소셜 기능 (계획)
- [ ] 소셜 로그인 (카카오, 구글, 네이버)
- [ ] 친구 시스템
- [ ] 단체 채팅방
- [ ] 친구 추천 공유

### 📅 v9.0 - 프리미엄 (계획)
- [ ] 무제한 추천 (무료: 10회/일)
- [ ] 광고 제거
- [ ] 토스페이먼츠 결제
- [ ] 프리미엄 전용 기능

---

## 🎯 타겟 사용자

### Primary
- **20-30대 OTT 구독자**: 넷플릭스, 디즈니+ 등 2개 이상 구독
- **영화 애호가**: 주 2회 이상 영화 시청
- **추천 피로**: "오늘 뭐 볼까?" 매일 고민

### Secondary
- **커플/가족**: 함께 볼 영화 찾기
- **직장인**: 퇴근 후 힐링용 영화
- **학생**: 데이트 영화 추천

---

## 📈 비즈니스 모델

### 무료 플랜
- 일 10회 추천
- 기본 필터링
- 프렌즈 평점 조회

### 프리미엄 플랜 (₩4,900/월)
- **무제한 추천**
- **광고 제거**
- **우선 업데이트**: 신작 정보 우선 제공
- **프리미엄 필터**: 감독, 배우별 검색
- **친구 추천 공유**: 친구에게 영화 추천 전송

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
