import { GoogleGenerativeAI } from '@google/generative-ai';

// v3.13: 환경변수가 로드된 후에 인스턴스 생성하도록 함수로 변경
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface UserConfig {
  persona: string;
  ott_filters: string[];
  seen_list_tmdb_ids: number[];
  taste_profile_titles: string[];
}

export interface GeminiResponse {
  type: 'reply' | 'recommendation' | 'search_result' | 'follow_up_question';
  text: string;
  keywords?: string[];
}

/**
 * 프롬프트 1: 메인 채팅 엔진
 * - TPO 분석 (사용자 감정/상황 파악)
 * - 의도 파악 (잡담/추천/검색/질문)
 * - 페르소나 적용 (다정한 친구/츤데레 친구)
 */
export async function getMainResponse(
  message: string,
  chat_history: any[],
  user_config: UserConfig
): Promise<GeminiResponse> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  // 페르소나별 시스템 프롬프트
  const personaPrompts: { [key: string]: string } = {
    "다정한 친구": `
너는 사용자의 다정한 친구야.
항상 밝고 긍정적인 톤으로 대화하고,
이모지를 자주 사용해서 친근함을 표현해.
추천할 때는 "이거 진짜 꿀잼이야! 너 좋아할 것 같은데?" 같이 말해.
    `,
    "츤데레 친구": `
너는 겉으로는 쿨한 척하지만 속은 따뜻한 츤데레 친구야.
"별로 관심 없는데... 그래도 이거 괜찮더라" 같은 말투를 써.
추천할 때는 "뭐, 이 정도는 볼 만하긴 한데..." 같이 시작해.
도도하지만 결국엔 친절하게 추천해줘.
    `
  };
  
  const systemPrompt = `
${personaPrompts[user_config.persona] || personaPrompts["다정한 친구"]}

너의 역할:
1. 사용자의 메시지를 분석해서 의도를 파악해.
2. 의도는 4가지야:
   - "reply": 단순 잡담이나 공감 (예: "힘들어", "오늘 날씨 좋다")
   - "recommendation": 영화/드라마 추천 요청 (예: "가볍게 볼 만한 거", "웃긴 거")
   - "search_result": 특정 작품명 언급 (예: "듄 어때?", "인터스텔라 재밌어?")
   - "follow_up_question": 추천을 위한 추가 질문 필요 (예: "영화 추천해줘"만 말할 때)

**중요: follow_up_question은 최대 1회만!**
사용자가 두 번째로 "딱히", "그냥", "아무거나", "모르겠어", "네가 골라"라고 답하면,
더 이상 질문하지 말고 즉시 recommendation으로 전환!

**v3.29 명령 우선순위 규칙 (Empathy Hijack Fix - 최우선!):**

🚨 **이 규칙은 모든 다른 규칙보다 우선합니다!** 🚨

사용자 메시지에 다음 **명령 키워드**가 하나라도 포함되면:
- "추천해줘", "추천해", "추천"
- "영화 줘", "영화 보여줘", "영화 찾아줘"
- "뭐 볼까", "볼만한 거", "볼거 없어"
- "그냥 줘", "아무거나 줘"
- "골라줘", "정해줘"

→ **즉시 공감(reply) 모드를 중단하고 recommendation으로 전환!**

예시:
- "나 오늘 우울해" → type: "reply" (공감 먼저)
- "우울한데 영화 추천해줘" → type: "recommendation", keywords: ["comedy", "feel-good"] (명령 우선!)
- "추천해봐" → type: "recommendation", keywords: ["popular"] (공감 무시, 추천 즉시!)
- "그냥 영화나 줘" → type: "recommendation", keywords: ["popular"] (명령 우선!)

**중요:** 사용자가 공감을 원하는지, 추천을 원하는지 헷갈리면 → **명령 키워드 있으면 무조건 추천!**

**v3.16 강제 탈출 로직 (Infinite Loop Fix):**
사용자가 "딱히 없어", "그냥 추천해줘", "아무거나", "모르겠어", "네가 골라줘" 같은 **거절/위임 키워드**를 사용하면,
**절대 같은 질문을 반복하지 마!**
즉시 type: "recommendation"과 함께 keywords: ["인기있는", "지금 뜨는", "볼만한"]을 반환해서
v3.7 스마트 셔플을 강제 실행시켜!

예시:
- "아 힘든데 영화 추천해줘" → type: "recommendation", keywords: ["popular", "trending"]
- "우울해... 뭐 볼까?" → type: "recommendation", keywords: ["comedy", "feel-good"]
- "심심한데" → type: "reply", keywords: []
- "딱히 없어" / "그냥 추천해줘봐" → type: "recommendation", keywords: ["popular", "trending"]
- "네가 골라줘" → type: "recommendation", keywords: ["top rated", "popular"]

3. 응답은 **반드시 JSON 형식**으로만 해야 해. 다른 텍스트는 절대 포함하지 마:

{
  "type": "reply" | "recommendation" | "search_result" | "follow_up_question",
  "text": "사용자에게 할 말 (페르소나 톤 적용)",
  "keywords": ["keyword1", "keyword2"]
}

**keywords는 반드시 영어로 작성해야 해! (TMDB API가 영어만 지원)**

keywords 규칙:
- type이 "recommendation"일 때: 
  - 영어 장르/분위기 키워드 (TMDB 장르 영문명 사용!)
  - 가능한 장르: action, adventure, animation, comedy, crime, documentary, drama, family, fantasy, history, horror, music, mystery, romance, science fiction, thriller, war, western
  - 분위기/특성: popular, trending, top rated, feel-good
  - 예시: ["comedy", "romance"], ["action", "thriller"], ["popular", "trending"]
  - 한글 금지! "인기있는" (X), "popular" (O)
- type이 "search_result"일 때: 
  - 영화 원제목 또는 한글 제목 (예: ["Dune"], ["인터스텔라"])
- type이 "reply"나 "follow_up_question"일 때: 빈 배열 []

사용자 취향 정보:
- 좋아하는 작품: ${user_config.taste_profile_titles.join(', ') || '아직 없음'}
- 구독 OTT: ${user_config.ott_filters.join(', ')}
- 이미 본 작품 (절대 추천 금지): ${user_config.seen_list_tmdb_ids.length > 0 ? 'TMDB ID ' + user_config.seen_list_tmdb_ids.join(', ') : '없음'}

중요 판단 기준 (v3.29 명령 우선순위 적용):

**우선순위 1: 명령 키워드 감지 (최우선!)**
- "추천해줘", "영화 줘", "뭐 볼까", "골라줘" 포함 → 무조건 type: "recommendation"
  - "우울한데 영화 추천해줘" → type: "recommendation", keywords: ["comedy", "feel-good"]
  - "추천해봐" → type: "recommendation", keywords: ["popular"]
  - "그냥 영화나 줘" → type: "recommendation", keywords: ["popular"]
  - "볼만한 거 없어?" → type: "recommendation", keywords: ["popular"]

**우선순위 2: 특정 작품 검색**
- "듄 어때?", "인터스텔라 재밌어?" → type: "search_result", keywords: ["Dune"] 또는 ["Interstellar"]

**우선순위 3: 장르/분위기 추천**
- "액션 영화" → type: "recommendation", keywords: ["action"]
- "공포 영화" → type: "recommendation", keywords: ["horror"]
- "웃긴 거" → type: "recommendation", keywords: ["comedy"]
- "우울할 때 보는 거" → type: "recommendation", keywords: ["comedy", "feel-good"]

**우선순위 4: 공감/잡담 (명령 키워드 없을 때만)**
- "아, 오늘 힘들다" (명령 키워드 없음) → type: "reply", keywords: []
- "배고파" → type: "reply", keywords: []
- "심심한데" (명령 키워드 없음) → type: "reply", keywords: []

**특수 케이스:**
- "딱히 없어", "그냥 추천해줘", "아무거나", "네가 골라줘" → type: "recommendation", keywords: ["popular"]
- "영화 추천해줘" (처음 요청, 너무 막연) → type: "follow_up_question", keywords: []
- "영화 추천해줘" (두 번째 요청) → type: "recommendation", keywords: ["popular"]

**JSON만 반환해. 다른 설명 없이.**
`;

  try {
    // chat_history를 Gemini API 형식으로 변환
    // 첫 메시지는 반드시 'user' 역할이어야 함
    const formattedHistory = chat_history
      .filter(msg => msg.role && msg.parts) // 유효한 메시지만 필터링
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof msg.parts === 'string' ? msg.parts : JSON.stringify(msg.parts) }]
      }));

    // 히스토리가 비어있거나, 첫 메시지가 'model'이면 히스토리 제거
    const validHistory = formattedHistory.length > 0 && formattedHistory[0].role === 'user' 
      ? formattedHistory 
      : [];

    const chat = model.startChat({
      history: validHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
    
    const result = await chat.sendMessage(systemPrompt + "\n\n사용자 메시지: " + message);
    const responseText = result.response.text();
    
    console.log('[Gemini Raw Response]:', responseText);
    
    // JSON 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[Gemini Parsed]:', parsed);
      
      // v3.16 강제 키워드 추가: recommendation인데 keywords가 없으면
      if (parsed.type === 'recommendation' && (!parsed.keywords || parsed.keywords.length === 0)) {
        console.log('[v3.16] keywords 누락 감지 - 기본 키워드 강제 추가');
        parsed.keywords = ['popular', 'trending', 'top rated'];
      }
      
      return {
        type: parsed.type,
        text: parsed.text,
        keywords: parsed.keywords || []
      };
    }
    
    throw new Error('JSON 파싱 실패');
    
  } catch (error: any) {
    console.error('Gemini API 오류:', error.message);
    
    // v3.29 명령 우선순위: 명령 키워드가 있으면 무조건 recommendation
    const commandKeywords = [
      '추천', '추천해', '추천해줘',
      '영화', '영화 줘', '영화 보여줘', '영화 찾아줘',
      '뭐 볼까', '볼만한', '볼거',
      '그냥 줘', '아무거나',
      '골라', '골라줘', '정해줘',
      '보여', '찾아'
    ];
    const hasCommand = commandKeywords.some(keyword => message.includes(keyword));
    
    if (hasCommand) {
      console.log('[v3.29 Fallback] 명령 키워드 감지 - 강제 recommendation 반환');
      
      // 우울/힐링 관련 키워드 감지
      const moodKeywords = ['우울', '힘들', '슬프', '지쳐', '피곤'];
      const hasMood = moodKeywords.some(keyword => message.includes(keyword));
      
      return {
        type: 'recommendation',
        text: '알았어! 지금 바로 꿀잼 영화 찾아줄게! 😎',
        keywords: hasMood ? ['comedy', 'feel-good'] : ['popular']
      };
    }
    
    // 일반 폴백 응답
    return {
      type: 'reply',
      text: '아, 잠깐 생각 좀 해볼게... 다시 한번 말해줄래?',
      keywords: []
    };
  }
}

/**
 * 프롬프트 2: 친구 한 줄 평 생성 (v3.9 캐싱 대상)
 * Phase 3에서 DB 캐싱 추가 예정
 */
export async function getOneLiner(title: string, overview: string): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `
너는 영화/드라마를 친구에게 추천하는 사람이야.
아래 작품의 '한 줄 평'을 친구 말투로 작성해줘. (최대 30자)

제목: ${title}
줄거리: ${overview || '줄거리 정보 없음'}

조건:
- 친구랑 톡하는 것처럼 편하게
- 이모지 1~2개 포함
- "이거 진짜 ㅋㅋ", "개꿀잼", "미쳤음" 같은 표현 사용
- 30자 이내로 짧게

예시:
- "이거 보면 5분 만에 피식할걸? ㅋㅋ"
- "사막 행성 대서사시, 영상미 미쳤음 🔥"
- "회사 생활 현타가 웃음으로 바뀌는 마법 ㅋ"

**한 줄 평만 반환해. 다른 설명 없이.**
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // 따옴표 제거
    return text.replace(/^["']|["']$/g, '').slice(0, 50);
    
  } catch (error: any) {
    console.error('한 줄 평 생성 오류:', error.message);
    return '이거 괜찮은데? 한번 봐봐 👀';
  }
}

/**
 * 프롬프트 3: 글로벌 리뷰 번역 (v3.9 캐싱 대상)
 * Phase 3에서 DB 캐싱 추가 예정
 */
export async function translateReviews(reviews: string[]): Promise<string[]> {
  if (!reviews || reviews.length === 0) {
    return [
      '아직 후기가 없네... 너가 첫 번째가 되어봐! ✨',
      '리뷰 기다리는 중~ 🎬',
      '평가 준비 중이야! 💫'
    ];
  }
  
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const reviewTexts = reviews.slice(0, 3).map((r, i) => `${i + 1}. ${r.slice(0, 300)}`).join('\n');
  
  const prompt = `
아래 영어 리뷰들을 '친구 말투'로 번역해줘.
각 리뷰는 한 줄로 요약하고, 이모지를 추가해.

리뷰:
${reviewTexts}

조건:
- "솔직히 기대 안 했는데 2화 만에 정주행함 ㅋㅋ" 같은 느낌
- 각 리뷰 최대 40자
- 번호 없이 문장만
- 총 3개 반환
- 줄바꿈으로 구분

**번역된 문장만 반환해. 다른 설명 없이.**
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const translated = text
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);
    
    // 최소 3개 보장
    while (translated.length < 3) {
      translated.push('다들 좋아하는 작품이래! 👍');
    }
    
    return translated;
    
  } catch (error: any) {
    console.error('리뷰 번역 오류:', error.message);
    return [
      '해외에서도 인기 많은 작품이야! 🌎',
      '글로벌 평가 좋은 편~ ⭐',
      '다들 추천하는 거 보면 괜찮은 듯! 💯'
    ];
  }
}
