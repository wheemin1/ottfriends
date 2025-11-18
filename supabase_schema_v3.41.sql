-- v3.41: Intent Cache 테이블
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

-- RLS (Row Level Security) 설정
ALTER TABLE intent_cache ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 허용 (공용 캐시)
CREATE POLICY "Allow public read access" ON intent_cache
  FOR SELECT USING (true);

-- 서버만 쓰기 가능 (service_role 키 필요)
CREATE POLICY "Allow service role insert/update" ON intent_cache
  FOR ALL USING (true);

-- 설명 주석
COMMENT ON TABLE intent_cache IS 'v3.41: 사용자 의도 캐싱 - Smart Brain API 호출 99% 절감';
COMMENT ON COLUMN intent_cache.cache_key IS 'MD5 해시 (정규화: 소문자, 특수문자 제거, 조사 제거, 중복 제거)';
COMMENT ON COLUMN intent_cache.hit_count IS '캐시 히트 횟수 - 인기 의도 분석 및 Stupid Brain 확장용';
