# 🗺️ OTT Friend 로드맵 (Roadmap)

**프로젝트명:** OTT Friend (WhyFirstImpression)  
**버전:** v3.22 → v5.0  
**작성일:** 2025-11-17  
**목표:** AI 기반 영화 추천 웹앱 출시

---

## 🎯 비전 (Vision)

> "친구에게 물어보듯 편하게, AI와 대화하며 찾는 나만의 인생작"

### 핵심 가치
1. **친구 같은 AI** - 공감하고 이해하는 대화형 추천
2. **다운로드 없음** - 브라우저에서 바로 시작
3. **정직한 가격** - 무료 플랜 + 합리적 프리미엄

---

## 📅 전체 로드맵 타임라인

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1-3: MVP 기반 (완료)           │ 2025-11-17         │
├─────────────────────────────────────────────────────────────┤
│  Phase 4: 로그인 & 결제               │ 2025-11-18 ~ 11-24 │
├─────────────────────────────────────────────────────────────┤
│  Phase 5: 소셜 & 커뮤니티             │ 2025-11-25 ~ 12-01 │
├─────────────────────────────────────────────────────────────┤
│  Phase 6: 고급 기능 & 출시            │ 2025-12-02 ~ 12-15 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Phase 1: 기본 인프라 (완료)

**기간:** 2025-11-17 (1일)  
**완성도:** 100%

### 주요 성과
- ✅ React + Express 풀스택 구조
- ✅ Tailwind CSS + shadcn/ui 디자인 시스템
- ✅ Cozy Night Mode (#1A202C + #F59E0B)
- ✅ 보안 체계 (100점)
- ✅ Port 3000 로컬 환경

### 기술 스택 확정
- **Frontend:** React 18.3.1 + TypeScript + Wouter
- **Backend:** Express 4.21.2 + tsx
- **Database:** Supabase PostgreSQL
- **AI:** Gemini 2.0 Flash Experimental
- **APIs:** TMDB API

---

## ✅ Phase 2: AI 추천 엔진 (완료)

**기간:** 2025-11-17 (1일)  
**완성도:** 100%

### 주요 성과
- ✅ Gemini API 3-프롬프트 아키텍처
- ✅ TMDB Discover API 통합
- ✅ v3.16 강제 탈출 로직
- ✅ v3.29 Empathy Hijack Fix
- ✅ 영어 키워드 강제 (TMDB 호환)
- ✅ 스마트 셔플 (평점 기반)

### 해결된 버그
- ✅ 무한 루프 문제
- ✅ TMDB 검색 0개 버그
- ✅ Chat History 포맷 에러
- ✅ Gemini 모델 Deprecated

---

## ✅ Phase 3: 캐싱 & 최적화 (완료)

**기간:** 2025-11-17 (1일)  
**완성도:** 100%

### 주요 성과
- ✅ Supabase 캐싱 (99% 비용 절감)
- ✅ Context API 상태 관리
- ✅ localStorage 지속성
- ✅ v3.22 랜딩페이지 (스크롤 화살표)
- ✅ v3.21b 토스트 UX (실행 취소)
- ✅ v3.20 채팅 경계선
- ✅ v3.19 Sticky Input

### 성능 개선
- **API 비용:** $0.10 → $0.001 (99% 절감)
- **응답 속도:** 6배 향상 (캐시 히트)

---

## ⏳ Phase 4: 로그인 & 결제 (진행 예정)

**기간:** 2025-11-18 ~ 11-24 (1주)  
**완성도:** 0%  
**우선순위:** 🔴 HIGH

### 4-1. NextAuth.js 통합 (v4.1)

#### 목표
Lazy Login 구현 - 로그인 없이 체험 → 필요 시 OAuth

#### 작업 항목
- [ ] NextAuth.js 4.1 설치 및 설정
  ```bash
  npm install next-auth@4
  ```
- [ ] `/api/auth/[...nextauth]` 라우트 생성
- [ ] OAuth 제공자 설정:
  - [ ] Google OAuth
  - [ ] Kakao OAuth (한국 사용자)
  - [ ] Apple OAuth (iOS 사용자)
- [ ] NEXTAUTH_SECRET 생성
  ```powershell
  openssl rand -base64 32
  ```
- [ ] Session 관리 (JWT 전략)
- [ ] Middleware 인증 체크

#### 트리거 시나리오
1. **찜하기/이미 봄 클릭** → 로그인 유도
2. **3회 추천 소진** → 로그인 유도
3. **채팅 히스토리 저장** → 로그인 필수

#### UI/UX
- [ ] 로그인 모달 (AuthDialog.tsx)
- [ ] "Google로 계속하기" 버튼
- [ ] "나중에 하기" 옵션
- [ ] 로그인 후 이전 작업 복원

#### 데이터베이스
- [ ] Supabase `users` 테이블 생성
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    provider TEXT, -- 'google', 'kakao', 'apple'
    provider_id TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] NextAuth Adapter 설정 (Supabase)

**완료 기준:**
- 로그인 없이 3회 추천 가능
- 로그인 후 찜/이미 봄 기능 작동
- OAuth 3개 제공자 정상 작동

**예상 소요:** 2일

---

### 4-2. 채팅 히스토리 저장 (v4.2)

#### 목표
ChatGPT처럼 과거 대화 기록 저장/불러오기

#### 작업 항목
- [ ] Supabase `chat_history` 테이블 생성
  ```sql
  CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    title TEXT, -- "액션 영화 추천", "코미디 영화"
    messages JSONB, -- [{role, content, timestamp}]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] POST /api/chat-sessions (새 세션 생성)
- [ ] GET /api/chat-sessions (내 세션 목록)
- [ ] GET /api/chat-sessions/:id (특정 세션 불러오기)
- [ ] PATCH /api/chat-sessions/:id (세션 업데이트)
- [ ] DELETE /api/chat-sessions/:id (세션 삭제)

#### UI 구현
- [ ] AppSidebar에 채팅 히스토리 리스트 추가
  ```
  [ ✨ 새 대화 시작 ]
  ────────────────────
  [ 💬 오늘 ]
    - 액션 영화 추천 (2시간 전)
    - 코미디 찾아줘 (4시간 전)
  [ 💬 어제 ]
    - 공포 영화 (1일 전)
  [ 💬 이번 주 ]
    - 로맨스 (3일 전)
  ```
- [ ] 클릭 시 대화 복원
- [ ] 세션 제목 자동 생성 (Gemini)
- [ ] 삭제 확인 다이얼로그

#### 자동 저장
- [ ] 메시지 전송 시 자동 저장
- [ ] 5분 간격 자동 백업
- [ ] localStorage ↔ Supabase 동기화

**완료 기준:**
- 과거 대화 목록 표시
- 세션 클릭 시 대화 복원
- 삭제 기능 정상 작동

**예상 소요:** 2일

---

### 4-3. Stripe 결제 통합 (v4.3)

#### 목표
프리미엄 구독 결제 (첫 달 ₩990)

#### 작업 항목
- [ ] Stripe 계정 생성 및 API 키 발급
- [ ] stripe 패키지 설치
  ```bash
  npm install stripe
  ```
- [ ] 환경변수 추가
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Stripe Checkout Session 생성
  - [ ] POST /api/create-checkout-session
  - [ ] 가격 ID 설정 (₩990/month)
- [ ] Webhook 핸들러 (결제 성공 처리)
  - [ ] POST /api/webhooks/stripe
  - [ ] users 테이블 is_premium 업데이트
  - [ ] subscriptions 테이블 생성
    ```sql
    CREATE TABLE subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      status TEXT, -- 'active', 'canceled', 'past_due'
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ```

#### UI 구현
- [ ] PricingSection "프리미엄 시작하기" 버튼
- [ ] Stripe Checkout 리디렉션
- [ ] 결제 성공 페이지 (SuccessPage.tsx)
- [ ] 결제 실패 페이지 (CancelPage.tsx)
- [ ] 구독 관리 페이지 (MySubscription.tsx)
  - 현재 플랜
  - 결제 내역
  - 구독 취소

#### 쿼터 시스템 업데이트
- [ ] 프리미엄 사용자는 무제한 추천
- [ ] UsageStats 컴포넌트에 "무제한" 표시
- [ ] 무료 사용자는 매일 00시 쿼터 리셋

**완료 기준:**
- 결제 페이지 정상 작동
- Webhook으로 프리미엄 상태 자동 업데이트
- 구독 취소 기능 작동

**예상 소요:** 3일

---

## ⏳ Phase 5: 소셜 & 커뮤니티 (진행 예정)

**기간:** 2025-11-25 ~ 12-01 (1주)  
**완성도:** 0%  
**우선순위:** 🟡 MEDIUM

### 5-1. 영화 후기 시스템 (v5.1)

#### 목표
사용자가 작성한 후기를 DetailsPanel에 표시

#### 작업 항목
- [ ] comments 테이블 완성
  ```sql
  CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id INTEGER NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] POST /api/comments 완성 (v3.4에서 스텁 → 실제 구현)
- [ ] GET /api/comments/:movieId 완성
- [ ] DetailsPanel에 후기 섹션 추가
  - 다른 사용자 후기 리스트
  - 평점 별점 표시
  - 작성자 프로필 사진

#### UI 구현
- [ ] CommentList.tsx
- [ ] CommentItem.tsx (유저 후기 카드)
- [ ] CommentForm.tsx (후기 작성 폼)
- [ ] 평점 입력 (⭐⭐⭐⭐⭐)
- [ ] 스포일러 가리기 옵션

**예상 소요:** 2일

---

### 5-2. 공유 기능 (v5.2)

#### 목표
"친구에게 공유" 기능

#### 작업 항목
- [ ] 공유 URL 생성
  - `/share/:movieId`
  - Open Graph 메타태그
- [ ] 공유 버튼
  - 카카오톡
  - 트위터
  - 페이스북
  - URL 복사
- [ ] ShareDialog.tsx 컴포넌트
- [ ] QR 코드 생성 (모바일 전송)

**예상 소요:** 1일

---

### 5-3. 좋아요 & 통계 (v5.3)

#### 목표
인기 영화 순위, 좋아요 기능

#### 작업 항목
- [ ] movie_stats 테이블
  ```sql
  CREATE TABLE movie_stats (
    movie_id INTEGER PRIMARY KEY,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    wishlist_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] GET /api/stats/trending (인기 영화)
- [ ] POST /api/stats/:movieId/like (좋아요)
- [ ] TrendingSection.tsx (랜딩페이지)

**예상 소요:** 2일

---

## ⏳ Phase 6: 고급 기능 & 출시 (진행 예정)

**기간:** 2025-12-02 ~ 12-15 (2주)  
**완성도:** 0%  
**우선순위:** 🟢 LOW (출시 후 추가 가능)

### 6-1. 고급 필터링 (v6.1)

#### 작업 항목
- [ ] 연도 필터 (1990~2025)
- [ ] 평점 필터 (7.0 이상)
- [ ] 장르 다중 선택 (액션+코미디)
- [ ] OTT 다중 필터 (넷플+디플)
- [ ] 러닝타임 필터 (90분 이하, 180분 이상 등)

**예상 소요:** 2일

---

### 6-2. AI 학습 개선 (v6.2)

#### 작업 항목
- [ ] 사용자 피드백 수집
  - "이 추천이 마음에 드나요?" (👍👎)
- [ ] taste_profile 자동 업데이트
- [ ] 장르 선호도 분석
- [ ] 추천 정확도 향상

**예상 소요:** 3일

---

### 6-3. 모바일 최적화 (v6.3)

#### 작업 항목
- [ ] 모바일 Bottom Sheet (DetailsPanel)
- [ ] 터치 제스처 (스와이프)
- [ ] iOS Safari 테스트
- [ ] Android Chrome 테스트
- [ ] PWA 매니페스트
- [ ] 앱 아이콘 생성

**예상 소요:** 3일

---

### 6-4. SEO & 성능 최적화 (v6.4)

#### 작업 항목
- [ ] SSR (Server-Side Rendering)
  - React → Next.js 마이그레이션 고려
- [ ] 메타태그 최적화
  - 제목, 설명, 키워드
  - Open Graph
  - Twitter Cards
- [ ] 이미지 최적화
  - WebP 변환
  - Lazy Loading
- [ ] Code Splitting
- [ ] Lighthouse 점수 90+ 달성

**예상 소요:** 4일

---

## 🚀 출시 체크리스트

### Phase 1~4 완료 후 베타 출시 (v4.0)

- [ ] **기능 테스트**
  - [ ] 회원가입/로그인
  - [ ] AI 추천 (10회 이상)
  - [ ] 찜하기/이미 봄
  - [ ] 결제 플로우
  - [ ] 채팅 히스토리

- [ ] **브라우저 호환성**
  - [ ] Chrome (Windows/Mac)
  - [ ] Safari (Mac/iOS)
  - [ ] Edge
  - [ ] Firefox

- [ ] **성능 테스트**
  - [ ] 동시 접속 100명
  - [ ] API 응답 속도 < 3초
  - [ ] 캐시 히트율 > 90%

- [ ] **보안 점검**
  - [ ] SQL Injection 방어
  - [ ] XSS 방어
  - [ ] CSRF 토큰
  - [ ] Rate Limiting

- [ ] **법률/약관**
  - [ ] 이용약관
  - [ ] 개인정보 처리방침
  - [ ] 환불 정책
  - [ ] 쿠키 정책

- [ ] **도메인 & 배포**
  - [ ] 도메인 구매 (ottfriend.com)
  - [ ] Vercel/Railway 배포
  - [ ] HTTPS 인증서
  - [ ] CDN 설정

---

## 📊 버전별 마일스톤

| 버전 | 주요 기능 | 출시일 | 상태 |
|------|----------|--------|------|
| **v3.0** | MVP 기반 | 2025-11-17 | ✅ 완료 |
| **v3.22** | 랜딩페이지 완성 | 2025-11-17 | ✅ 완료 |
| **v4.0** | 로그인 & 결제 | 2025-11-24 | ⏳ 진행 예정 |
| **v4.5** | 베타 출시 | 2025-11-30 | ⏳ 계획 중 |
| **v5.0** | 소셜 기능 | 2025-12-07 | ⏳ 계획 중 |
| **v6.0** | 정식 출시 | 2025-12-15 | ⏳ 계획 중 |

---

## 🎯 핵심 KPI (Key Performance Indicators)

### 기술적 목표
- ✅ API 비용: 99% 절감 (달성)
- ⏳ 캐시 히트율: > 90%
- ⏳ API 응답 속도: < 3초
- ⏳ Lighthouse 점수: > 90

### 비즈니스 목표
- ⏳ 베타 사용자: 100명
- ⏳ 일 활성 사용자(DAU): 50명
- ⏳ 프리미엄 전환율: 5%
- ⏳ 추천 만족도: 80%+

---

## 🛠️ 기술 부채 (Technical Debt)

### 알려진 이슈
1. **Server Auto-Restart**
   - tsx가 파일 변경 시 자동 재시작 안 됨
   - 해결책: nodemon 또는 tsx --watch 고려

2. **PostCSS Warning**
   - "did not pass the `from` option"
   - 영향: 없음 (경고만)
   - 해결책: postcss.config.js 수정

3. **Supabase Cache Error 로그**
   - "Cannot coerce the result to a single JSON object"
   - 영향: 없음 (Cache MISS 정상 작동)
   - 해결책: .single() 대신 .maybeSingle() 사용

### 리팩토링 예정
- [ ] server/routes.ts 파일 분리 (너무 김)
- [ ] 컴포넌트 폴더 구조 재정리
- [ ] 타입 정의 파일 통합 (shared/types.ts)

---

## 📚 문서화 로드맵

- [x] PROGRESS.md (진행사항)
- [x] ROADMAP.md (로드맵)
- [x] SECURITY_REPORT.md (보안)
- [ ] API_DOCS.md (API 명세)
- [ ] DEPLOYMENT.md (배포 가이드)
- [ ] CONTRIBUTING.md (기여 가이드)
- [ ] CHANGELOG.md (변경 이력)

---

## 🔄 주간 스프린트 계획

### Week 1 (2025-11-18 ~ 11-24)
- **목표:** Phase 4 완료
- **일정:**
  - 월~화: NextAuth.js (v4.1)
  - 수~목: 채팅 히스토리 (v4.2)
  - 금~토: Stripe 결제 (v4.3)
  - 일: 통합 테스트

### Week 2 (2025-11-25 ~ 12-01)
- **목표:** Phase 5 완료
- **일정:**
  - 월~화: 영화 후기 (v5.1)
  - 수: 공유 기능 (v5.2)
  - 목~금: 좋아요 & 통계 (v5.3)
  - 토~일: 베타 출시 준비

### Week 3-4 (2025-12-02 ~ 12-15)
- **목표:** Phase 6 완료 & 정식 출시
- **일정:**
  - Week 3: 고급 기능 구현
  - Week 4: 성능 최적화 & 출시

---

## 🎉 성공 지표

### 베타 출시 기준 (v4.5)
- ✅ Phase 1~4 완료
- ✅ 100명 테스트 완료
- ✅ 결제 1건 이상 성공
- ✅ 치명적 버그 0건

### 정식 출시 기준 (v6.0)
- ✅ Phase 1~5 완료
- ✅ SEO 최적화 완료
- ✅ 모바일 최적화 완료
- ✅ 1,000명 사용자 확보
- ✅ 프리미엄 전환율 5%+

---

**작성자:** GitHub Copilot  
**마지막 업데이트:** 2025-11-17 22:20 KST  
**다음 리뷰:** 2025-11-24 (Phase 4 완료 후)
