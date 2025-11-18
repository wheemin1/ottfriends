# 🚦 v3.35: 지능형 라우터 (Intelligent Router) - 1851 토큰 공포 해결

**작성일**: 2025-11-18  
**목표**: 비용 90% 절감 + 무료 플랜 지속 가능성 확보

---

## 🎯 문제 정의: "1851 토큰의 공포"

### Before (v3.34 이전)
```
모든 메시지 → Gemini 2.0 (1851 토큰 프롬프트)
- "ㅋㅋ" → 1851 토큰 ($0.001)
- "안녕" → 1851 토큰 ($0.001)
- "우울해" → 1851 토큰 ($0.001)
- "영화 추천해줘" → 1851 토큰 ($0.001)

결과: 100% Smart Brain 사용 → 파산 위험 ⚠️
```

### 사용자 행동 패턴 분석
- **90%**: 잡담/공감 ("ㅋㅋ", "안녕", "우울해")
- **10%**: 추천/검색 ("영화 추천해줘", "인터스텔라 어때?")

→ **90%의 메시지에 "비싼 뇌"를 쓰는 것은 낭비!**

---

## 💡 해결 전략: "뇌 2개" 아키텍처

### 뇌 A: 저렴한 뇌 (Cheap Brain)
- **목적**: 잡담/공감만 처리 (type: "reply")
- **엔진**: Gemini 2.0 Flash (저렴)
- **프롬프트 크기**: ~100 토큰 (1851의 1/18)
- **비용**: $0.0001/요청 (추정)
- **처리 비율**: 90% (잡담)

**프롬프트 예시**:
```
너는 사용자의 다정한 친구야. 이름은 'OTT 친구'야.

역할:
- 밝고 긍정적인 톤으로 이모지를 자주 사용해.
- 반말로 대화해.
- 잡담과 공감만 해줘.
- 절대 영화 추천, 검색, 질문은 하지 마.
- 짧고 간결하게 (1~2문장).

JSON 형식으로만 응답해:
{
  "type": "reply",
  "text": "네가 할 말"
}
```

### 뇌 B: 비싼 뇌 (Smart Brain)
- **목적**: 추천/검색/복잡한 작업 처리
- **엔진**: Gemini 2.0 Flash Experimental
- **프롬프트 크기**: ~1851 토큰 (기존)
- **비용**: $0.001/요청 (추정)
- **처리 비율**: 10% (추천/검색)

**프롬프트**: 기존 `server/lib/gemini.ts`의 `getMainResponse()` 프롬프트 그대로 사용

---

## 🚦 지능형 라우터 (Intelligent Router)

### 라우팅 로직 (server/routes.ts)

```typescript
// v3.35: 명령 키워드 리스트
const RECOMMEND_KEYWORDS = [
  "추천해줘", "추천해", "추천",
  "영화 줘", "영화 보여줘", "영화 찾아줘",
  "뭐 볼까", "볼만한 거", "볼거 없어",
  "그냥 줘", "아무거나 줘", "골라줘", "정해줘",
  "딱히 없어", "아무거나", "네가 골라줘", "모르겠어" // v3.16 강제 탈출
];

const SEARCH_KEYWORDS = ["어때", "재밌어", "정보 알려줘", "줄거리"];

// 라우팅 로직
let intent = 'CHAT'; // 기본값: 잡담

// 1. 추천 키워드 검사 (최우선)
for (const keyword of RECOMMEND_KEYWORDS) {
  if (message.includes(keyword)) {
    intent = 'RECOMMEND';
    break;
  }
}

// 2. 검색 키워드 검사
if (intent === 'CHAT') {
  for (const keyword of SEARCH_KEYWORDS) {
    if (message.includes(keyword)) {
      intent = 'SEARCH';
      break;
    }
  }
}

// 3. 영화 제목 패턴 감지
if (intent === 'CHAT') {
  const titlePattern = /["'「『《](.+?)["'」』》]|(\S{2,})\s*(어때|재밌|재밌어|좋아)/;
  if (titlePattern.test(message)) {
    intent = 'SEARCH';
  }
}

// 라우팅 실행
if (intent === 'RECOMMEND' || intent === 'SEARCH') {
  // Smart Brain 호출 (1851 토큰)
  response = await callSmartBrain(message, chatHistory, config);
} else {
  // Cheap Brain 호출 (100 토큰)
  response = await callCheapBrain(message, chatHistory, config.persona);
}
```

---

## 📊 비용 절감 효과

### Before (v3.34)
```
하루 사용 패턴 (무료 유저):
- 잡담 45회 × $0.001 = $0.045
- 추천 3회 × $0.001 = $0.003
- 검색 2회 × $0.001 = $0.002

총 비용/일: $0.050
총 비용/월 (100명): $150
```

### After (v3.35)
```
하루 사용 패턴 (무료 유저):
- 잡담 45회 × $0.0001 = $0.0045
- 추천 3회 × $0.001 = $0.003
- 검색 2회 × $0.001 = $0.002

총 비용/일: $0.0095
총 비용/월 (100명): $28.5

절감액: $150 - $28.5 = $121.5/월 (81% 절감)
```

### 1000명 규모
```
Before: $1,500/월
After: $285/월

절감액: $1,215/월 (81% 절감) 💰
```

---

## 🔧 구현 세부사항

### 1. cheapBrain.ts (저렴한 뇌)
**파일**: `server/lib/ai/cheapBrain.ts`

**핵심 로직**:
```typescript
export async function callCheapBrain(
  message: string,
  chatHistory: any[] = [],
  persona: string = '다정한 친구'
): Promise<CheapBrainResponse> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // 초경량 프롬프트 (~100 토큰)
  const systemPrompt = `
너는 사용자의 ${persona}야. 이름은 'OTT 친구'야.
잡담과 공감만 해줘. 절대 영화 추천/검색은 하지 마.
짧고 간결하게 (1~2문장).

JSON 형식으로만 응답해:
{"type": "reply", "text": "네가 할 말"}
`;

  // 최근 3개 대화만 포함 (토큰 절약)
  const recentHistory = chatHistory.slice(-3);

  const chat = model.startChat({
    history: recentHistory,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 100, // 토큰 제한
    }
  });

  const result = await chat.sendMessage(systemPrompt + message);
  return JSON.parse(result.response.text());
}
```

**특징**:
- ✅ 최근 3개 대화만 포함 (vs 전체 히스토리)
- ✅ `maxOutputTokens: 100` (vs 무제한)
- ✅ 프롬프트 100 토큰 (vs 1851 토큰)
- ✅ 페르소나별 Fallback 응답

---

### 2. smartBrain.ts (비싼 뇌)
**파일**: `server/lib/ai/smartBrain.ts`

**핵심 로직**:
```typescript
export async function callSmartBrain(
  message: string,
  chatHistory: any[],
  userConfig: UserConfig
): Promise<GeminiResponse> {
  console.log('[Smart Brain] 1851 토큰 프롬프트 실행...');
  
  // 기존 gemini.ts의 getMainResponse 그대로 사용
  return await getMainResponse(message, chatHistory, userConfig);
}
```

**특징**:
- ✅ 기존 v3.29 + v3.16 로직 재사용
- ✅ 1851 토큰 프롬프트 (변경 없음)
- ✅ 추천/검색/질문 모두 처리

---

### 3. routes.ts (라우터)
**파일**: `server/routes.ts`

**핵심 변경**:
```typescript
// Before
const response = await getMainResponse(message, chatHistory, config);

// After
if (intent === 'RECOMMEND' || intent === 'SEARCH') {
  response = await callSmartBrain(message, chatHistory, config);
} else {
  response = await callCheapBrain(message, chatHistory, config.persona);
}
```

**라우팅 우선순위**:
1. 추천 키워드 감지 → Smart Brain
2. 검색 키워드 감지 → Smart Brain
3. 영화 제목 패턴 → Smart Brain
4. 기본값 (잡담) → Cheap Brain

---

## 🎭 시나리오 테스트

### 시나리오 1: 잡담
```
User: "ㅋㅋ"
Router: CHAT (Cheap Brain)
Prompt: 100 토큰
Response: "뭐 그렇게 웃겨? ㅋㅋ 😆"
Cost: $0.0001
```

### 시나리오 2: 공감 대화
```
User: "나 오늘 우울해..."
Router: CHAT (Cheap Brain)
Prompt: 100 토큰
Response: "아... 무슨 일 있어? 괜찮아? 🥺"
Cost: $0.0001
```

### 시나리오 3: 추천 명령
```
User: "영화 추천해줘"
Router: RECOMMEND (Smart Brain)
Prompt: 1851 토큰
Response: type="recommendation", keywords=["popular"]
Cost: $0.001
```

### 시나리오 4: v3.29 공감 + 추천
```
User: "우울한데 영화 추천해줘"
Router: RECOMMEND (Smart Brain) ← "추천해줘" 키워드 감지
Prompt: 1851 토큰
Response: type="recommendation", keywords=["comedy", "feel-good"]
Cost: $0.001
```

### 시나리오 5: 영화 검색
```
User: "인터스텔라 어때?"
Router: SEARCH (Smart Brain) ← "어때" + 제목 패턴
Prompt: 1851 토큰
Response: type="search_result", keywords=["Interstellar"]
Cost: $0.001
```

---

## 📈 v4.0 연계: 쿼터 시스템

### 무료 플랜 (v3.10 기준)
```typescript
// Cheap Brain 쿼터
if (intent === 'CHAT') {
  if (userConfig.quotas.chats.used >= userConfig.quotas.chats.total) {
    return res.status(403).json({ 
      error: '오늘 잡담 쿼터(50회)를 다 썼어요! 내일 다시 만나요 😊' 
    });
  }
  // 쿼터 차감 로직
}

// Smart Brain 쿼터
if (intent === 'RECOMMEND' || intent === 'SEARCH') {
  if (userConfig.quotas.recommendations.used >= userConfig.quotas.recommendations.total) {
    return res.status(403).json({ 
      error: '오늘 추천 쿼터(3회)를 다 썼어요! 프리미엄으로 업그레이드하면 무제한! 🚀' 
    });
  }
  // 쿼터 차감 로직
}
```

### 프리미엄 플랜
```typescript
if (userConfig.isPremium) {
  // 무제한 Smart Brain 사용
  response = await callSmartBrain(message, chatHistory, config);
} else {
  // 쿼터 검사 후 라우팅
}
```

---

## 🔍 모니터링 & 디버깅

### 로그 출력
```typescript
// Cheap Brain 호출
console.log('[v3.35] 💬 저렴한 뇌 (Cheap Brain) 호출 - 100 토큰 프롬프트');

// Smart Brain 호출
console.log('[v3.35] 🧠 비싼 뇌 (Smart Brain) 호출 - 1851 토큰 프롬프트');

// 라우터 결정
console.log(`[v3.35 Router] 추천 키워드 감지: "${keyword}" → Smart Brain`);
```

### 예상 로그 출력
```
[v3.35 Router] 추천 키워드 감지: "추천해줘" → Smart Brain
[v3.35] 🧠 비싼 뇌 (Smart Brain) 호출 - 1851 토큰 프롬프트
[Smart Brain] 1851 토큰 프롬프트 실행...
[Gemini Raw Response]: {"type":"recommendation",...}
[Routes] AI 응답: { type: 'recommendation', keywords: ['comedy'] }
```

---

## ✅ 완료 체크리스트

- [x] `server/lib/ai/cheapBrain.ts` 생성 (100 토큰 프롬프트)
- [x] `server/lib/ai/smartBrain.ts` 생성 (기존 gemini.ts 래핑)
- [x] `server/routes.ts` 라우터 로직 추가
- [x] v3.29 명령 우선순위 규칙 통합
- [x] v3.16 강제 탈출 키워드 통합
- [x] 페르소나별 Fallback 응답
- [ ] 쿼터 시스템 연계 (v4.0 예정)
- [ ] 프리미엄 플랜 무제한 처리 (v4.0 예정)

---

## 🎉 결론

**v3.35 지능형 라우터**는 "1851 토큰의 공포"를 해결하는 핵심 아키텍처입니다.

### 핵심 성과
- ✅ **81% 비용 절감** (100명 기준: $150 → $28.5/월)
- ✅ **무료 플랜 지속 가능성** 확보
- ✅ **v3.29 + v3.16 로직 보존** (기존 기능 유지)
- ✅ **프리미엄 모델 준비** (Smart Brain 무제한 판매)

### 비유
> "라면 끓일 땐 가스버너, 핵융합 발전소는 추천할 때만!" 🍜⚡

**이제 "어떻게하지"는 끝났습니다.** 🎯

---

**작성일**: 2025-11-18  
**버전**: v3.35  
**다음 단계**: v4.0 (쿼터 시스템 + 프리미엄 플랜)
