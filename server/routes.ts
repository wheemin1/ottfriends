import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMainResponse, getOneLiner, translateReviews, UserConfig } from "./lib/gemini";
import { getMovieDetails, searchMoviesByKeywords, searchMovieByTitle, getAvailableOTTPlatforms, getGenreNames, getTrending, getUpcoming } from "./lib/tmdb";
import { getCachedMovieData, setCachedMovieData } from "./lib/supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/chat
   * 메인 채팅 엔드포인트 (v3.29 Empathy Hijack Fix 적용)
   */
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, chatHistory = [], userConfig = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // 기본 사용자 설정
      const config: UserConfig = {
        persona: userConfig.persona || '다정한 친구',
        ott_filters: userConfig.ott_filters || ['netflix'],
        seen_list_tmdb_ids: userConfig.seen_list_tmdb_ids || [],
        taste_profile_titles: userConfig.taste_profile_titles || [],
      };

      // Gemini API 호출
      const response = await getMainResponse(message, chatHistory, config);

      console.log('[Routes] Gemini 응답:', { type: response.type, keywords: response.keywords });

      // v3.16 강제 탈출 로직: 키워드 없이 recommendation이 온 경우 기본 키워드 제공
      let keywords = response.keywords || [];
      if (response.type === 'recommendation' && keywords.length === 0) {
        keywords = ['popular'];
        console.log('[v3.16] 강제 탈출: 기본 키워드 적용', keywords);
      }

      console.log('[Routes] 최종 keywords:', keywords);

      // v3.11: 데이터 불일치 버그 수정 - 정확한 movie 객체 전달
      let recommendations = null;
      if (response.type === 'recommendation' && keywords.length > 0) {
        console.log('[Routes] TMDB 검색 실행 시작...');
        // TMDB에서 영화 검색
        const movies = await searchMoviesByKeywords(
          keywords,
          config.seen_list_tmdb_ids,
          config.ott_filters
        );

        console.log(`[Routes] TMDB 검색 완료: ${movies.length}개 영화`);

        recommendations = movies.map(movie => ({
          id: movie.id, // v3.11: 정확한 TMDB ID
          title: movie.title,
          posterPath: movie.poster_path,
          voteAverage: movie.vote_average,
        }));
      } else if (response.type === 'search_result' && response.keywords && response.keywords.length > 0) {
        // 특정 영화 검색
        const movie = await searchMovieByTitle(response.keywords[0]);
        if (movie) {
          recommendations = [{
            id: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            voteAverage: movie.vote_average,
          }];
        }
      }

      res.json({
        type: response.type,
        text: response.text,
        recommendations,
      });

    } catch (error: any) {
      console.error('Chat API 오류:', error);
      res.status(500).json({ 
        error: '채팅 처리 중 오류가 발생했습니다',
        type: 'reply',
        text: '아, 잠깐 생각 좀 해볼게... 다시 한번 말해줄래?'
      });
    }
  });

  /**
   * GET /api/movie/:id
   * 영화 상세 정보 (v3.9 캐싱 포함)
   */
  app.get("/api/movie/:id", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      console.log('[Routes] GET /api/movie/:id called with movieId:', movieId);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID' });
      }

      // TMDB에서 상세 정보 가져오기 (append_to_response 사용)
      console.log('[Routes] Fetching movie details from TMDB...');
      const movie = await getMovieDetails(movieId);
      if (!movie) {
        console.log('[Routes] Movie not found in TMDB');
        return res.status(404).json({ error: 'Movie not found' });
      }
      console.log('[Routes] TMDB movie data received:', movie.title);

      // v3.9: Supabase 캐시 확인 (99% API 비용 절감)
      const cached = await getCachedMovieData(movieId);
      let oneLiner: string;
      let translatedReviews: string[];

      if (cached) {
        console.log(`[Cache HIT] 영화 ${movieId} 캐시 사용`);
        oneLiner = cached.one_liner;
        translatedReviews = cached.translated_reviews;
      } else {
        console.log(`[Cache MISS] 영화 ${movieId} Gemini 호출 시작`);
        // AI 한 줄 평 생성
        oneLiner = await getOneLiner(movie.title, movie.overview);

        // 글로벌 리뷰 번역
        const reviewTexts = movie.reviews?.results.map(r => r.content) || [];
        translatedReviews = await translateReviews(reviewTexts);

        // 캐시에 저장
        await setCachedMovieData(movieId, oneLiner, translatedReviews);
        console.log(`[Cache SAVE] 영화 ${movieId} 캐시 저장 완료`);
      }

      // OTT 플랫폼 정보
      const platforms = getAvailableOTTPlatforms(movie);

      // 장르 정보
      const genre = movie.genres 
        ? movie.genres.map(g => g.name).join(' · ')
        : getGenreNames(movie.genre_ids || []);

      // 출연진 정보 (상위 6명)
      const cast = movie.credits?.cast.slice(0, 6).map(actor => ({
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path 
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : null,
      })) || [];

      res.json({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? movie.release_date.split('-')[0] : '',
        runtime: movie.runtime ? `${movie.runtime}분` : '',
        genre,
        rating: movie.vote_average,
        posterUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        oneLiner,
        platforms,
        plot: movie.overview,
        reviews: translatedReviews,
        cast,
      });

    } catch (error: any) {
      console.error('Movie details API 오류:', error);
      res.status(500).json({ error: '영화 정보를 가져오는 중 오류가 발생했습니다' });
    }
  });

  /**
   * POST /api/comments
   * 영화 후기 작성 (v3.4 Lazy Login 트리거)
   */
  app.post("/api/comments", async (req, res) => {
    try {
      // v3.4 Lazy Login: Authorization 헤더 검증
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: '로그인이 필요합니다.',
          reason: 'LAZY_LOGIN_REQUIRED'
        });
      }

      const { movieId, commentText } = req.body;

      if (!movieId || !commentText) {
        return res.status(400).json({ error: 'movieId와 commentText가 필요합니다.' });
      }

      // TODO: Supabase DB에 댓글 저장
      // const userId = verifyToken(authHeader.split(' ')[1]);
      // await addMovieComment(movieId, userId, commentText);

      res.json({ 
        success: true,
        message: '후기가 등록되었습니다!'
      });

    } catch (error: any) {
      console.error('Comments API 오류:', error);
      res.status(500).json({ error: '후기 등록 중 오류가 발생했습니다' });
    }
  });

  /**
   * GET /api/comments/:movieId
   * 영화 후기 조회
   */
  app.get("/api/comments/:movieId", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID' });
      }

      // TODO: Supabase DB에서 댓글 조회
      // const comments = await getMovieComments(movieId);

      // 임시 응답
      res.json([
        { user: '바이브코더', comment: '이거 진짜 꿀잼 인정입니다 ㅋㅋ', timestamp: new Date().toISOString() }
      ]);

    } catch (error: any) {
      console.error('Comments fetch API 오류:', error);
      res.status(500).json({ error: '후기를 가져오는 중 오류가 발생했습니다' });
    }
  });

  /**
   * v3.35: GET /api/discovery/trending
   * 트렌딩 영화 (6시간 캐싱)
   */
  app.get("/api/discovery/trending", async (req, res) => {
    try {
      const movies = await getTrending();
      res.json(movies);
    } catch (error: any) {
      console.error('Trending API 오류:', error);
      res.status(500).json({ error: '트렌딩 영화를 가져오는 중 오류가 발생했습니다' });
    }
  });

  /**
   * v3.35: GET /api/discovery/upcoming
   * 개봉 예정 영화 (6시간 캐싱)
   */
  app.get("/api/discovery/upcoming", async (req, res) => {
    try {
      const movies = await getUpcoming();
      res.json(movies);
    } catch (error: any) {
      console.error('Upcoming API 오류:', error);
      res.status(500).json({ error: '개봉 예정 영화를 가져오는 중 오류가 발생했습니다' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
