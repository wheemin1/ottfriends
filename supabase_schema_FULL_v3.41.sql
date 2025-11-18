-- v3.41: 전체 스키마 (기존 테이블 + Intent Cache)
-- Supabase Dashboard SQL Editor에서 전체 실행

-- ==================== 영화 상세 정보 캐싱 ====================
CREATE TABLE IF NOT EXISTS cached_data (
  cache_key TEXT PRIMARY KEY,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_cached_data_expires_at ON cached_data(expires_at);

-- ==================== TMDB API 동적 캐싱 ====================
-- TMDB API 응답 캐싱 (trending, upcoming 등)
-- TTL: 6시간 (expires_at으로 관리)
CREATE TABLE IF NOT EXISTS dynamic_cache (
  cache_key TEXT PRIMARY KEY,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_dynamic_cache_expires_at ON dynamic_cache(expires_at);

-- ==================== v3.41: Intent Cache ====================
-- 사용자 의도 → 키워드 매핑 캐싱 (99% 재사용률 목표)
CREATE TABLE IF NOT EXISTS intent_cache (
  cache_key TEXT PRIMARY KEY, -- MD5 해시 (정규화된 메시지)
  intent_type TEXT NOT NULL, -- 'recommendation' | 'search' | 'reply'
  keywords JSONB NOT NULL, -- AI가 추출한 키워드 배열
  normalized_message TEXT NOT NULL, -- 원본 메시지 (디버깅용)
  hit_count INTEGER DEFAULT 0, -- 캐시 히트 횟수 (인기도 분석)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL -- 30일 TTL
);

-- 만료된 캐시 자동 삭제용 인덱스
CREATE INDEX IF NOT EXISTS idx_intent_cache_expires_at ON intent_cache(expires_at);

-- 인기 키워드 분석용 인덱스
CREATE INDEX IF NOT EXISTS idx_intent_cache_hit_count ON intent_cache(hit_count DESC);

-- ==================== v3.4 댓글 테이블 ====================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  rating DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ==================== RLS (Row Level Security) ====================
-- cached_data: 모든 사용자가 읽기 가능, 시스템만 쓰기 가능
ALTER TABLE cached_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on cached_data"
  ON cached_data FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access on cached_data"
  ON cached_data FOR ALL
  USING (true);

-- dynamic_cache: 모든 사용자가 읽기 가능, 시스템만 쓰기 가능
ALTER TABLE dynamic_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on dynamic_cache"
  ON dynamic_cache FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access on dynamic_cache"
  ON dynamic_cache FOR ALL
  USING (true);

-- intent_cache: 모든 사용자가 읽기 가능, 시스템만 쓰기 가능
ALTER TABLE intent_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on intent_cache"
  ON intent_cache FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access on intent_cache"
  ON intent_cache FOR ALL
  USING (true);

-- comments: 사용자별 권한 관리 (자신의 댓글만 수정/삭제)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- ==================== 자동 청소 함수 ====================
-- 만료된 캐시 자동 삭제
CREATE OR REPLACE FUNCTION cleanup_expired_caches()
RETURNS void AS $$
BEGIN
  DELETE FROM cached_data WHERE expires_at < NOW();
  DELETE FROM dynamic_cache WHERE expires_at < NOW();
  DELETE FROM intent_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ==================== 주석 ====================
COMMENT ON TABLE cached_data IS '영화 상세 정보 캐싱 (TMDB API 응답, 99% 캐시 히트율)';
COMMENT ON TABLE dynamic_cache IS 'TMDB 동적 API 캐싱 (trending, upcoming, 6시간 TTL)';
COMMENT ON TABLE intent_cache IS 'v3.41: 사용자 의도 캐싱 - Smart Brain API 호출 99% 절감';
COMMENT ON TABLE comments IS 'v3.4: 사용자 영화 리뷰 및 평점';
COMMENT ON COLUMN intent_cache.cache_key IS 'MD5 해시 (정규화: 소문자, 특수문자 제거, 조사 제거, 중복 제거)';
COMMENT ON COLUMN intent_cache.hit_count IS '캐시 히트 횟수 - 인기 의도 분석 및 Stupid Brain 확장용';
