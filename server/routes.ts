import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getOneLiner, translateReviews, UserConfig } from "./lib/gemini";
import { getMovieDetails, searchMoviesByKeywords, searchMovieByTitle, getAvailableOTTPlatforms, getGenreNames, getTrending, getUpcoming } from "./lib/tmdb";
import { getCachedMovieData, setCachedMovieData, getIntentCache, setIntentCache } from "./lib/supabase";
import { callSmartBrain } from "./lib/ai/smartBrain";
import { getCheapResponse } from "./lib/ai/cheapBrain"; // v4.0.4: 0원 방화벽 추가

// v4.0.4: Cheap Brain → Intent Cache → Smart Brain 순서 (파산 방지 라우팅)

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/chat
   * v4.0: Simple Pivot - Intent Cache → Smart Brain Only
   * Cost savings: $150/month (98% reduction)
   */
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, chatHistory = [], userConfig = {} } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const config: UserConfig = {
        persona: userConfig.persona || '다정한 친구',
        ott_filters: userConfig.ott_filters || ['netflix'],
        seen_list_tmdb_ids: userConfig.seen_list_tmdb_ids || [],
        taste_profile_titles: userConfig.taste_profile_titles || []
      };

      // v4.0.4: [1단계] Cheap Brain - 0원 방화벽 (최우선 실행)
      const cheapResponse = getCheapResponse(message, config.persona);
      if (cheapResponse) {
        console.log('💰 [v4.0.4] Cheap Brain 성공 - 비용 $0');
        return res.json({
          type: cheapResponse.type,
          text: cheapResponse.text,
          keywords: cheapResponse.keywords,
          recommendations: undefined,
          config
        });
      }

      // v4.0.2: [2단계] Intent Cache 에러 처리 (테이블 없으면 MISS)
      let cachedIntent;
      try {
        cachedIntent = await getIntentCache(message);
      } catch (cacheError) {
        console.log('[v4.0.2] Intent Cache 테이블 없음 - MISS 처리');
        cachedIntent = null;
      }
      
      let response;
      if (cachedIntent) {
        console.log('[v4.0 Intent Cache] HIT:', message, '| Cost: $0');
        // v4.0.2: keywords가 배열인지 확인
        const keywords = Array.isArray(cachedIntent.keywords) ? cachedIntent.keywords : [];
        response = {
          type: cachedIntent.intent_type,
          text: config.persona === '다정한 친구' 
            ? (cachedIntent.intent_type === 'recommendation' ? '좋아, 이런 영화들 어때? 😊' : '알겠어!')
            : (cachedIntent.intent_type === 'recommendation' ? '뭐, 이 정도는 볼 만한데...' : '...알았어.'),
          keywords: keywords
        };
      } else {
        console.log('[v4.0] Smart Brain 호출 - Intent Cache MISS');
        try {
          response = await callSmartBrain(message, chatHistory, config);
          
          // v4.0.2: Cache 저장 시도 (실패해도 무시)
          if (response.type === 'recommendation' || response.type === 'search') {
            try {
              await setIntentCache(message, response.type, response.keywords || []);
            } catch (setCacheError) {
              console.log('[v4.0.2] Intent Cache 저장 실패 (무시)');
            }
          }
        } catch (smartBrainError) {
          console.error('[v4.0.2] Smart Brain 실패 - Fallback 사용:', smartBrainError);
          // v4.0.2 Fallback: 기본 키워드로 추천
          response = {
            type: 'recommendation',
            text: config.persona === '다정한 친구' 
              ? '좋아, 이런 영화들 어때? 😊' 
              : '뭐, 이 정도는 볼 만한데...',
            keywords: ['인기', '최신', '감동'] // 기본 키워드
          };
        }
      }

      let recommendations = [];
      if (response.keywords && response.keywords.length > 0) {
        const movieResults = await searchMoviesByKeywords(
          response.keywords,
          config.seen_list_tmdb_ids,
          config.ott_filters
        );
        recommendations = movieResults.slice(0, 5).map(movie => ({
          id: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          voteAverage: movie.vote_average,
        }));
      }

      return res.json({
        type: response.type,
        text: response.text,
        keywords: response.keywords,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        config
      });

    } catch (error) {
      console.error('[v4.0] Error:', error);
      return res.status(500).json({ 
        type: 'reply',
        text: '죄송해요, 다시 시도해주세요!'
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

      // v4.3.2: 예고편 URL (YouTube)
      const trailerVideo = movie.videos?.results.find(
        v => v.site === 'YouTube' && v.type === 'Trailer'
      );
      const trailerUrl = trailerVideo 
        ? `https://www.youtube.com/watch?v=${trailerVideo.key}`
        : null;

      // v4.3.2: 실제 TMDB 글로벌 후기 (영어 원문)
      const globalReviews = movie.reviews?.results
        .slice(0, 5)
        .map(review => ({
          author: review.author,
          content: review.content.slice(0, 300) + (review.content.length > 300 ? '...' : ''),
          rating: review.author_details?.rating || null,
        })) || [];

      // v4.3.2: 프렌즈 평점 (사용자들이 남긴 평점 평균)
      const { getFriendsRating } = await import('./lib/supabase');
      const friendsRatingData = await getFriendsRating(movieId);

      res.json({
        id: movie.id,
        title: movie.title,
        originalTitle: movie.original_title, // v4.1: 영문 제목 (매거진 히어로용)
        year: movie.release_date ? movie.release_date.split('-')[0] : '',
        runtime: movie.runtime ? `${movie.runtime}분` : '',
        genre,
        rating: movie.vote_average,
        friendsRating: friendsRatingData.average,
        friendsRatingCount: friendsRatingData.count,
        posterUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        backdropUrl: movie.backdrop_path  // v4.1: 풀-블리드 배경용
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
          : null,
        images: {  // v4.1: 갤러리용 이미지들
          backdrops: movie.images?.backdrops?.slice(0, 9).map(img => 
            `https://image.tmdb.org/t/p/w780${img.file_path}`
          ) || [],
          posters: movie.images?.posters?.slice(0, 6).map(img =>
            `https://image.tmdb.org/t/p/w342${img.file_path}`
          ) || []
        },
        oneLiner,
        platforms,
        plot: movie.overview,
        reviews: translatedReviews,  // AI 번역된 후기 (기존)
        globalReviews,  // v4.3.2: 실제 TMDB 후기 (영어 원문)
        trailerUrl,  // v4.3.2: 예고편 YouTube URL
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

      const { movieId, rating, commentText } = req.body;

      if (!movieId || !commentText) {
        return res.status(400).json({ error: 'movieId와 commentText가 필요합니다.' });
      }

      if (rating && (rating < 1 || rating > 10)) {
        return res.status(400).json({ error: '평점은 1~10 사이여야 합니다.' });
      }

      // v4.3.2: Supabase DB에 댓글 저장
      // TODO Phase 4: NextAuth 토큰 검증 후 userId 추출
      // const userId = verifyToken(authHeader.split(' ')[1]);
      // const { addMovieComment } = await import('./lib/supabase');
      // await addMovieComment(movieId, userId, rating, commentText);
      
      // 임시: 로그인 기능 없이 성공 응답 (Phase 4에서 구현)
      console.log('[Comments] 후기 등록 요청:', { movieId, rating, commentText });

      res.json({ 
        success: true,
        message: '후기가 등록되었습니다! (Phase 4에서 DB 저장 구현 예정)'
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
