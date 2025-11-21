/**
 * TMDB API 통합 라이브러리
 * v3.7/v3.9: 스마트 셔플 및 캐싱 로직
 * v4.0.1: Supabase dynamic_cache 복구 (메모리 캐시 = Vercel에서 재앙)
 * v4.5: 영어 리뷰 AI 번역 (왓챠피디아 베스트 리뷰어 스타일)
 * v4.5.3: cached_data 테이블로 통합 (중복 제거)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// v4.5: Gemini AI 초기화
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  'watch/providers'?: any;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  reviews?: {
    results: Array<{
      author: string;
      content: string;
      created_at: string;
      author_details?: {
        rating?: number;
      };
    }>;
  };
  // v4.3.2: 예고편 지원
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      name: string;
    }>;
  };
  // v4.1: 매거진 UI용 이미지 갤러리
  images?: {
    backdrops: Array<{
      file_path: string;
      width: number;
      height: number;
      vote_average: number;
    }>;
    posters: Array<{
      file_path: string;
      width: number;
      height: number;
    }>;
  };
}

/**
 * v4.5: 영어 리뷰를 한국어 네티즌 말투로 번역 (캐싱 적용)
 * 스타일: 왓챠피디아 베스트 리뷰어 / 영화 매거진 에디터
 * - 비속어 금지, 이모지 최소화
 * - 분석적이고 감성적인 문체
 * - "~한 작품이다", "~를 느꼈다" 같은 완결된 문장
 * - Supabase cached_data 테이블 사용 (routes.ts와 통합)
 */
async function translateReviewsToKorean(movieId: number, reviews: any[]): Promise<any[]> {
  if (!reviews || reviews.length === 0) {
    return [];
  }

  // 1. 캐시 확인 (cached_data 테이블 사용 - routes.ts와 통합)
  const { getCachedMovieData } = await import('./supabase');
  const cached = await getCachedMovieData(movieId);
  
  if (cached?.translated_reviews && cached.translated_reviews.length > 0) {
    console.log(`💰 [리뷰 캐시 HIT] 영화 ${movieId} - 번역 비용 $0`);
    return cached.translated_reviews;
  }

  // 2. 캐시 MISS - AI 번역 (비용 발생!)
  console.log(`💸 [리뷰 캐시 MISS] 영화 ${movieId} - AI 번역 시작...`);

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt = `You are a professional film critic and translator. Translate these English movie reviews into Korean with the following style:

Style Guide:
- Professional magazine editor / Watcha Pedia best reviewer tone
- Analytical and emotional writing
- NO slang, NO profanity
- Minimal emojis
- Use complete sentences: "~한 작품이다", "~를 느꼈다"
- Poetic and sophisticated expressions

Reviews to translate (with authors):
${reviews.map((r, i) => `[Review ${i + 1}] by ${r.author}\n${r.content.substring(0, 500)}`).join('\n\n')}

Return ONLY a JSON array of translated reviews (2-3 sentences each, max 150 characters per review):
["번역된 리뷰 1", "번역된 리뷰 2", "번역된 리뷰 3"]

Note: Keep the professional tone and preserve the critical insights from the original reviews.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // JSON 파싱
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const translatedTexts = JSON.parse(jsonMatch[0]);
      const translatedReviews = translatedTexts.map((text: string, i: number) => ({
        author: reviews[i]?.author || 'Anonymous',
        content: text,
        created_at: reviews[i]?.created_at || new Date().toISOString(),
        author_details: reviews[i]?.author_details
      }));

      // 3. 캐시 저장은 routes.ts에서 한 줄 평과 함께 수행
      console.log(`✅ [리뷰 번역 완료] 영화 ${movieId} - routes.ts에서 캐싱 예정`);

      return translatedReviews;
    }

    // 파싱 실패 시 빈 배열 반환
    return [];
  } catch (error: any) {
    console.error('리뷰 번역 오류:', error.message);
    return [];
  }
}

/**
 * v4.5: 병렬 호출로 영어 리뷰 가져오고 AI 번역
 * - 기본 정보: ko-KR (한국어 줄거리, 배우 등)
 * - 리뷰: en-US (영어 리뷰) → AI가 한국어 네티즌 말투로 번역
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set');
    return null;
  }

  try {
    // 1. 기본 정보 (한국어)
    const detailsPromise = fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR&append_to_response=credits,watch/providers,images,videos`
    );

    // 2. 리뷰 정보 (영어! 여기가 핵심)
    const reviewsPromise = fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}&language=en-US`
    );

    const [detailsRes, reviewsRes] = await Promise.all([detailsPromise, reviewsPromise]);
    
    if (!detailsRes.ok) {
      throw new Error(`TMDB API error: ${detailsRes.status}`);
    }

    const details = await detailsRes.json();
    const reviewsData = await reviewsRes.json();

    // 3. 영어 리뷰 3개를 AI로 번역 (한국어 네티즌 말투) + 캐싱
    const englishReviews = reviewsData.results?.slice(0, 3) || [];
    const translatedReviews = await translateReviewsToKorean(movieId, englishReviews);

    // 4. 데이터 합치기
    return { 
      ...details, 
      reviews: { results: translatedReviews }
    };
  } catch (error: any) {
    console.error('TMDB getMovieDetails 오류:', error.message);
    return null;
  }
}

/**
 * v3.7: 키워드 기반 영화 검색 (스마트 셔플)
 * v3.10: /discover/movie API 사용 (인기도 기반)
 */
export async function searchMoviesByKeywords(
  keywords: string[],
  excludeIds: number[] = [],
  ottFilters: string[] = []
): Promise<TMDBMovie[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set');
    return [];
  }

  try {
    console.log('[TMDB] 검색 시작 - keywords:', keywords);
    
    // 키워드를 장르 ID로 매핑 (TMDB 장르 ID)
    const genreMap: Record<string, number> = {
      'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35,
      'crime': 80, 'documentary': 99, 'drama': 18, 'family': 10751,
      'fantasy': 14, 'history': 36, 'horror': 27, 'music': 10402,
      'mystery': 9648, 'romance': 10749, 'science fiction': 878,
      'thriller': 53, 'war': 10752, 'western': 37
    };

    // 키워드에서 장르 추출
    const genreIds = keywords
      .map(kw => genreMap[kw.toLowerCase()])
      .filter(id => id !== undefined);

    // /discover/movie API 사용 (인기도 기반)
    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=ko-KR&sort_by=popularity.desc&page=1`;
    
    if (genreIds.length > 0) {
      url += `&with_genres=${genreIds.join(',')}`;
    }
    
    console.log('[TMDB] 검색 URL:', url.replace(TMDB_API_KEY, 'HIDDEN'));
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    let results: TMDBMovie[] = data.results || [];
    
    console.log(`[TMDB] 검색 결과: ${results.length}개 영화 발견`);

    // v3.6: 이미 본 작품 제외
    if (excludeIds.length > 0) {
      results = results.filter(movie => !excludeIds.includes(movie.id));
    }

    // v3.7: 스마트 셔플 (평점 높은 순으로 정렬 후 상위 10개 중 랜덤)
    results.sort((a, b) => b.vote_average - a.vote_average);
    const topResults = results.slice(0, 10);
    
    // 셔플
    for (let i = topResults.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topResults[i], topResults[j]] = [topResults[j], topResults[i]];
    }

    const finalResults = topResults.slice(0, 3); // 최대 3개 반환
    console.log('[TMDB] 최종 추천:', finalResults.map(m => m.title));
    
    return finalResults;
  } catch (error: any) {
    console.error('TMDB searchMoviesByKeywords 오류:', error.message);
    return [];
  }
}

/**
 * 제목으로 영화 검색
 */
export async function searchMovieByTitle(title: string): Promise<TMDBMovie | null> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set');
    return null;
  }

  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=ko-KR&query=${encodeURIComponent(title)}&page=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // 첫 번째 결과의 상세 정보 가져오기
      return await getMovieDetails(data.results[0].id);
    }

    return null;
  } catch (error: any) {
    console.error('TMDB searchMovieByTitle 오류:', error.message);
    return null;
  }
}

/**
 * OTT 플랫폼별 제공 여부 확인 (한국 기준)
 * v3.39b: 데이터 없을 시 빈 배열 반환 (UI에서 "OTT 정보 없음" 표시)
 */
export function getAvailableOTTPlatforms(movie: TMDBMovie): Array<{name: string, logoPath: string}> {
  const platforms: Array<{name: string, logoPath: string}> = [];
  const watchProviders = movie['watch/providers'];
  
  console.log('[TMDB] watchProviders raw data:', JSON.stringify(watchProviders, null, 2));
  
  // KR 데이터 없으면 US 데이터 시도 (Fallback)
  if (!watchProviders || !watchProviders.results) {
    console.log('[TMDB] No watch providers data available');
    return platforms;
  }

  console.log('[TMDB] Available regions:', Object.keys(watchProviders.results));
  
  const krProviders = watchProviders.results.KR;
  const usProviders = watchProviders.results.US; // Fallback
  
  console.log('[TMDB] KR providers:', krProviders);
  console.log('[TMDB] US providers:', usProviders);
  
  const targetProviders = krProviders || usProviders;

  if (!targetProviders) {
    console.log('[TMDB] No KR or US watch providers');
    return platforms;
  }

  const flatrate = targetProviders.flatrate || [];
  const buy = targetProviders.buy || [];
  const rent = targetProviders.rent || [];

  console.log('[TMDB] flatrate:', flatrate.length, 'buy:', buy.length, 'rent:', rent.length);

  // v3.39c: 중복 제거 강화 (provider_name으로 필터링)
  // Priority: flatrate (구독) > buy (구매) > rent (대여)
  const allProviders = [...flatrate, ...buy, ...rent];
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();

  allProviders.forEach((provider: any) => {
    const normalizedName = provider.provider_name.toLowerCase().trim();
    
    if (provider.logo_path && !seenIds.has(provider.provider_id) && !seenNames.has(normalizedName)) {
      seenIds.add(provider.provider_id);
      seenNames.add(normalizedName);
      platforms.push({
        name: provider.provider_name,
        logoPath: `https://image.tmdb.org/t/p/original${provider.logo_path}`
      });
      console.log('[TMDB] Added platform:', provider.provider_name, 'ID:', provider.provider_id);
    } else {
      console.log('[TMDB] Skipped duplicate:', provider.provider_name, 'ID:', provider.provider_id);
    }
  });

  console.log(`[TMDB] Found ${platforms.length} OTT platforms:`, platforms.map(p => p.name));
  return platforms;
}

/**
 * 장르 ID를 이름으로 변환
 */
const genreMap: { [key: number]: string } = {
  28: '액션',
  12: '모험',
  16: '애니메이션',
  35: '코미디',
  80: '범죄',
  99: '다큐멘터리',
  18: '드라마',
  10751: '가족',
  14: '판타지',
  36: '역사',
  27: '공포',
  10402: '음악',
  9648: '미스터리',
  10749: '로맨스',
  878: 'SF',
  10770: 'TV 영화',
  53: '스릴러',
  10752: '전쟁',
  37: '서부',
};

export function getGenreNames(genreIds: number[]): string {
  return genreIds
    .map(id => genreMap[id] || '')
    .filter(name => name)
    .join(' · ');
}

/**
 * v4.0.1: 트렌딩 영화 가져오기 (Supabase 캐싱, Vercel 안전)
 * Cache HIT: Supabase에서 바로 반환 (TMDB 호출 0)
 * Cache MISS: TMDB 호출 → Supabase 캐싱 → 반환
 */
export async function getTrending(): Promise<TMDBMovie[]> {
  const cacheKey = 'tmdb:trending';

  try {
    // 1. Supabase 캐시 조회 (Cache HIT)
    const cached = await getDynamicCache(cacheKey);
    if (cached) {
      console.log('[TMDB] Supabase Cache HIT: trending');
      return cached as TMDBMovie[];
    }

    // 2. Cache MISS - TMDB API 호출
    console.log('[TMDB] Cache MISS: trending - Calling TMDB API');
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not set');
      return [];
    }

    const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=ko-KR`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const results: TMDBMovie[] = data.results?.slice(0, 10) || [];

    // 3. Supabase에 캐싱 (6시간)
    await setDynamicCache(cacheKey, results, 6);

    console.log(`[TMDB] Trending: ${results.length}개 영화 반환 (Cached)`);
    return results;
  } catch (error: any) {
    console.error('TMDB getTrending 오류:', error.message);
    return [];
  }
}

/**
 * v4.0.1: 개봉 예정 영화 가져오기 (Supabase 캐싱, Vercel 안전)
 */
export async function getUpcoming(): Promise<TMDBMovie[]> {
  const cacheKey = 'tmdb:upcoming';

  try {
    // 1. Supabase 캐시 조회 (Cache HIT)
    const cached = await getDynamicCache(cacheKey);
    if (cached) {
      console.log('[TMDB] Supabase Cache HIT: upcoming');
      return cached as TMDBMovie[];
    }

    // 2. Cache MISS - TMDB API 호출
    console.log('[TMDB] Cache MISS: upcoming - Calling TMDB API');
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY is not set');
      return [];
    }

    const url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=ko-KR&region=KR`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const results: TMDBMovie[] = data.results?.slice(0, 10) || [];

    // 3. Supabase에 캐싱 (6시간)
    await setDynamicCache(cacheKey, results, 6);

    console.log(`[TMDB] Upcoming: ${results.length}개 영화 반환 (Cached)`);
    return results;
  } catch (error: any) {
    console.error('TMDB getUpcoming 오류:', error.message);
    return [];
  }
}
