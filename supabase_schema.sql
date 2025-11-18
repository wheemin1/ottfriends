-- ==================== Supabase DB 스키마 v3.13 ====================
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요
-- https://app.supabase.com/project/_/sql

-- ==================== v4.1 사용자 테이블 ====================
-- NextAuth.js가 자동으로 관리하는 테이블들은 생성하지 않습니다
-- 대신 users 테이블에 is_premium 컬럼만 추가합니다

-- users 테이블이 NextAuth로 생성된 후 실행할 마이그레이션
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ==================== v3.9 캐시 테이블 ====================
CREATE TABLE IF NOT EXISTS cached_data (
  tmdb_id INTEGER PRIMARY KEY,
  one_liner TEXT NOT NULL,
  translated_reviews JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_cached_data_created_at ON cached_data(created_at DESC);

-- ==================== v3.35 동적 캐시 테이블 ====================
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

-- ==================== v3.4 댓글 테이블 ====================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON comments(movie_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- ==================== v4.0 채팅 히스토리 테이블 ====================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);

-- ==================== Row Level Security (RLS) 정책 ====================

-- cached_data: 모든 사용자가 읽기 가능, 시스템만 쓰기 가능
ALTER TABLE cached_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached data"
  ON cached_data FOR SELECT
  USING (true);

CREATE POLICY "Only service role can write cached data"
  ON cached_data FOR ALL
  USING (auth.role() = 'service_role');

-- dynamic_cache: 모든 사용자가 읽기 가능, 시스템만 쓰기 가능
ALTER TABLE dynamic_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dynamic cache"
  ON dynamic_cache FOR SELECT
  USING (true);

CREATE POLICY "Only service role can write dynamic cache"
  ON dynamic_cache FOR ALL
  USING (auth.role() = 'service_role');

-- comments: 로그인한 사용자만 읽기/쓰기 가능, 본인 댓글만 삭제 가능
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read comments"
  ON comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- chat_history: 본인 채팅만 읽기 가능
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own chat history"
  ON chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat history"
  ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==================== 유틸리티 함수 ====================

-- 오래된 캐시 데이터 정리 (30일 이상)
CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cached_data
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- v3.35: 만료된 동적 캐시 자동 정리
CREATE OR REPLACE FUNCTION cleanup_expired_dynamic_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM dynamic_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 통계 조회
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_comments INTEGER,
  total_chats INTEGER,
  is_premium BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM comments WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM chat_history WHERE user_id = user_uuid),
    COALESCE((SELECT is_premium FROM auth.users WHERE id = user_uuid), false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== 설치 확인 ====================
-- 아래 쿼리로 테이블이 생성되었는지 확인하세요
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
