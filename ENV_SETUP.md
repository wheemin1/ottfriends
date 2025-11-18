# 🔐 OTT 친구 환경변수 설정 가이드

## 📋 필수 단계

### 1️⃣ Gemini API 키 발급
1. https://aistudio.google.com/app/apikey 접속
2. Google 계정으로 로그인
3. **"Create API Key"** 클릭
4. 발급받은 키 복사 → `.env`의 `GEMINI_API_KEY`에 입력

---

### 2️⃣ TMDB API 키 발급
1. https://www.themoviedb.org/signup 가입
2. https://www.themoviedb.org/settings/api 접속
3. **"Request an API Key"** 클릭 → "Developer" 선택
4. **"API Read Access Token"** 복사 → `.env`의 `TMDB_API_KEY`에 입력

---

### 3️⃣ Supabase 프로젝트 생성 ⭐ 핵심!
1. https://app.supabase.com 접속
2. **"New Project"** 클릭
   - Organization: 기존 조직 선택 또는 새로 생성
   - Name: `ottfriend` (원하는 이름)
   - Database Password: 안전한 비밀번호 생성 (꼭 저장하세요!)
   - Region: `Northeast Asia (Seoul)` 선택
3. 프로젝트 생성 대기 (약 2분)

#### 3-1. Supabase API 키 확인
1. 좌측 메뉴 **Settings** > **API** 클릭
2. 다음 3개 키를 `.env`에 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 절대 노출 금지!)

#### 3-2. Supabase DB 스키마 실행
1. 좌측 메뉴 **SQL Editor** 클릭
2. **"New Query"** 클릭
3. `supabase_schema.sql` 파일의 전체 내용을 복사해서 붙여넣기
4. **"RUN"** 버튼 클릭 (초록색 체크 표시 확인)
5. 좌측 메뉴 **Table Editor**에서 테이블 생성 확인:
   - `cached_data` (v3.9 정적 캐싱)
   - `comments` (v3.4 자체 후기)
   - `chat_history` (v4.0 채팅 히스토리)

---

### 4️⃣ NextAuth Secret 생성
PowerShell에서 실행:
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

출력된 문자열을 `.env`의 `NEXTAUTH_SECRET`에 입력

---

## 🎯 현재 단계 (Phase 1 - 핵심 기능)

### ✅ 즉시 필요한 키 (3개)
```env
GEMINI_API_KEY=여기에_실제_키_입력
TMDB_API_KEY=여기에_실제_키_입력
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_실제_키_입력
SUPABASE_SERVICE_ROLE_KEY=여기에_실제_키_입력
NEXTAUTH_SECRET=여기에_생성한_시크릿_입력
```

### ⏳ 나중에 필요한 키 (v4.1 Lazy Login)
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### ⏳ 나중에 필요한 키 (v4.2 수익 모델)
- `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`

---

## 🚀 설치 후 서버 실행
```powershell
npm run dev
```

브라우저에서 http://localhost:3000 접속!

---

## 🔒 보안 체크리스트
- [x] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [x] `.env.example` 파일에는 실제 키가 없는지 확인
- [x] `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에서 사용하지 않기
- [x] Git에 커밋하기 전 `git status`로 `.env` 파일 제외 확인

---

## ❓ 문제 해결

### "GEMINI_API_KEY is not set" 에러
→ `.env` 파일에 키를 입력했는지 확인
→ 서버 재시작: `Ctrl+C` → `npm run dev`

### "Supabase environment variables are not set" 에러
→ Supabase 프로젝트를 생성하고 API 키를 `.env`에 입력했는지 확인

### "Database error" 에러
→ `supabase_schema.sql`을 Supabase SQL Editor에서 실행했는지 확인
→ Supabase Dashboard > Table Editor에서 테이블 생성 확인

---

## 📚 참고 문서
- Supabase 공식 문서: https://supabase.com/docs
- NextAuth.js 공식 문서: https://next-auth.js.org
- TMDB API 문서: https://developers.themoviedb.org/3
- Gemini API 문서: https://ai.google.dev/docs
