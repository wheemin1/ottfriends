import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set');
}

// 클라이언트용 Supabase 인스턴스
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버용 Supabase 인스턴스 (Service Role Key 사용)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * v3.9 정적 캐싱 - TMDB 데이터 캐시
 * cached_data 테이블 구조:
 * - tmdb_id (PK, integer)
 * - one_liner (text)
 * - translated_reviews (jsonb)
 * - created_at (timestamp)
 */
export async function getCachedMovieData(tmdbId: number) {
  const { data, error } = await supabase
    .from('cached_data')
    .select('one_liner, translated_reviews')
    .eq('tmdb_id', tmdbId)
    .single();

  if (error) {
    console.error('Cache read error:', error);
    return null;
  }

  return data;
}

export async function setCachedMovieData(
  tmdbId: number,
  oneLiner: string,
  translatedReviews: any[]
) {
  const { error } = await supabase.from('cached_data').upsert({
    tmdb_id: tmdbId,
    one_liner: oneLiner,
    translated_reviews: translatedReviews,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * v3.4 자체 후기 - 댓글 관리
 * comments 테이블 구조:
 * - id (PK, uuid)
 * - movie_id (FK, integer)
 * - user_id (FK, uuid)
 * - comment_text (text)
 * - created_at (timestamp)
 */
export async function getMovieComments(movieId: number) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users (
        id,
        name,
        avatar_url
      )
    `)
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Comments fetch error:', error);
    return [];
  }

  return data;
}

export async function addMovieComment(
  movieId: number,
  userId: string,
  commentText: string
) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      movie_id: movieId,
      user_id: userId,
      comment_text: commentText,
    })
    .select()
    .single();

  if (error) {
    console.error('Comment insert error:', error);
    return null;
  }

  return data;
}

/**
 * v4.2 수익 모델 - 구독 상태 관리
 * users 테이블의 is_premium 컬럼 업데이트
 */
export async function updateUserPremiumStatus(userId: string, isPremium: boolean) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not initialized');
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_premium: isPremium })
    .eq('id', userId);

  if (error) {
    console.error('Premium status update error:', error);
    throw error;
  }
}

export async function getUserPremiumStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Premium status fetch error:', error);
    return false;
  }

  return data?.is_premium || false;
}

/**
 * v3.35 동적 캐싱 - TMDB API 응답 캐싱 (6시간 TTL)
 * dynamic_cache 테이블 구조:
 * - cache_key (PK, text) - 예: 'tmdb:trending', 'tmdb:upcoming'
 * - cache_value (jsonb) - TMDB API 응답 데이터
 * - expires_at (timestamp) - 만료 시간
 * - created_at (timestamp)
 */
export async function getDynamicCache(cacheKey: string) {
  const { data, error } = await supabase
    .from('dynamic_cache')
    .select('cache_value, expires_at')
    .eq('cache_key', cacheKey)
    .single();

  if (error) {
    // 캐시 없음 (Cache MISS)
    return null;
  }

  // 만료 시간 확인
  if (new Date(data.expires_at) < new Date()) {
    console.log(`[Cache] Expired cache for key: ${cacheKey}`);
    // 만료된 캐시 삭제
    await supabase.from('dynamic_cache').delete().eq('cache_key', cacheKey);
    return null;
  }

  console.log(`[Cache] HIT for key: ${cacheKey}`);
  return data.cache_value;
}

export async function setDynamicCache(
  cacheKey: string,
  cacheValue: any,
  ttlHours: number = 6
) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  const { error } = await supabase.from('dynamic_cache').upsert({
    cache_key: cacheKey,
    cache_value: cacheValue,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error(`[Cache] Write error for key ${cacheKey}:`, error);
  } else {
    console.log(`[Cache] SET for key: ${cacheKey}, TTL: ${ttlHours}h`);
  }
}
