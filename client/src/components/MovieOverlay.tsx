/**
 * v4.4: Magazine-Style Movie Details Panel with Framer Motion
 * v7.1: Netflix-Style Cinematic Trailer Background (자동재생 예고편)
 * 고급스러운 오버레이 슬라이드 애니메이션 (Parallax Overlay)
 * 기존 영화는 살짝 밀리고, 새 영화가 그 위를 덮으며 들어온다
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { X, Heart, Popcorn, BookOpen, Globe, Users, MessageSquare, Star, Play } from "lucide-react";
import { getCurrentUser, signInWithGoogle, onAuthStateChange } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import OTTPlatforms from "./OTTPlatforms";
import ImageGallery from "./ImageGallery";
import friendlyAvatar from '@assets/generated_images/Friendly_AI_persona_avatar_ae12e60b.png';

interface MovieOverlayProps {
  open: boolean;
  onClose: () => void;
  movie?: {
    id?: number;
    title: string;
    originalTitle?: string;
    year: string;
    runtime: string;
    genre: string;
    rating: number;
    posterUrl: string;
    backdropUrl?: string;
    images?: {
      backdrops: string[];
      posters: string[];
    };
    oneLiner: string;
    platforms: Array<{name: string, logoPath: string}>;
    plot: string;
    reviews: string[];
    trailerUrl?: string;
    cast: { name: string; character: string; photo: string }[];
    friendsRating?: number;
    friendsRatingCount?: number;
  };
}

export default function MovieOverlay({ open, onClose, movie }: MovieOverlayProps) {
  // v7.1: YouTube videoId 추출 함수
  const getYouTubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // v6.15: movieId 변경 시 스크롤 초기화
  useEffect(() => {
    if (movie?.id && scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [movie?.id]);

  // v4.5: 리뷰 데이터 디버깅
  useEffect(() => {
    if (movie) {
      console.log('[MovieOverlay] Movie data:', movie);
      console.log('[MovieOverlay] Reviews:', movie.reviews);
      console.log('[MovieOverlay] Reviews type:', typeof movie.reviews);
      console.log('[MovieOverlay] Reviews is array:', Array.isArray(movie.reviews));
      console.log('[MovieOverlay] Reviews length:', movie.reviews?.length);
      console.log('[MovieOverlay] Reviews content:', JSON.stringify(movie.reviews, null, 2));
      console.log('[MovieOverlay] First review:', movie.reviews?.[0]);
    }
  }, [movie]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Array<{rating: number, text: string, author: string, date: string}>>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // v4.3.2: Supabase 인증 상태 확인
  useEffect(() => {
    // 현재 사용자 확인
    getCurrentUser().then((currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
    });

    // 인증 상태 변경 리스너
    const { data } = onAuthStateChange((currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
    });

    // 클린업
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  if (!movie) return null;

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "찜 목록에서 제거했어요" : "✨ 찜 목록에 추가했어요!",
      description: isWishlisted ? "찜 목록에서 삭제되었습니다" : "나중에 마이페이지에서 볼 수 있어요",
    });
  };

  const handleWatched = () => {
    setIsWatched(!isWatched);
    toast({
      title: isWatched ? "시청 기록에서 제거했어요" : "🎬 시청 완료!",
      description: isWatched ? "시청 기록에서 삭제되었습니다" : "마이페이지 시청 기록에 추가되었어요",
    });
  };

  const handleSubmitReview = async () => {
    if (!selectedRating) {
      toast({
        title: "평점을 선택해주세요",
        description: "1~10점 중 평점을 먼저 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "후기를 작성해주세요",
        description: "후기 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // v4.3.2: API 호출로 후기 저장
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: NextAuth 세션에서 토큰 가져오기
          // 'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          movieId: movie?.id,
          rating: selectedRating,
          commentText: reviewText,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        // 로그인 필요
        toast({
          title: "🔐 로그인이 필요해요",
          description: "Google 계정으로 로그인하면 후기를 작성할 수 있어요.",
          variant: "destructive",
        });
        // TODO: 로그인 모달 열기
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '후기 등록 실패');
      }

      // UI에 추가 (임시)
      const newReview = {
        rating: selectedRating,
        text: reviewText,
        author: '나',
        date: new Date().toLocaleDateString('ko-KR'),
      };

      setReviews([newReview, ...reviews]);
      setSelectedRating(null);
      setReviewText('');

      toast({
        title: "✅ 후기가 등록되었어요!",
        description: "친구들과 후기를 공유했습니다.",
      });
    } catch (error: any) {
      toast({
        title: "❌ 후기 등록 실패",
        description: error.message || '다시 시도해주세요.',
        variant: "destructive",
      });
    }
  };

  // v4.3: 장르를 배열로 분리
  const genres = movie.genre.split(' · ').filter(Boolean);

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-1/2 bg-background border-l border-border shadow-2xl z-[100]">
      {/* v8.2: 최종 수정 - 버튼을 독립적으로 배치 */}
      <div className="relative w-full h-full overflow-hidden">
        {/* v9.0: The Shining Button - 강화된 검은 아우라로 무조건 잘 보임 */}
        <div className="absolute top-6 right-6 z-[999]">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full w-12 h-12 bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-2xl backdrop-blur-md flex items-center justify-center"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <ScrollArea ref={scrollRef} className="h-full w-full absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={movie?.id || 'empty'}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="relative w-full h-auto"
            style={{ padding: 0, margin: 0 }}
          >{/* v8.2: 완전한 여백 제거 */}
              {/* v7.1: Cinematic Hero Section with Trailer or Backdrop */}
              <div className="relative w-full h-[60vh] overflow-hidden" style={{ margin: 0, padding: 0 }}>
                {/* v7.1: YouTube Trailer Background (자동재생, 음소거, 반복) */}
                {(() => {
                  const videoId = getYouTubeVideoId(movie.trailerUrl);
                  
                  if (videoId) {
                    return (
                      <>
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1`}
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-125"
                          style={{ border: 'none' }}
                          allow="autoplay; encrypted-media"
                          title="Movie Trailer"
                        />
                        {/* v7.2: 강화된 그라데이션 (텍스트 가독성 최우선) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-black/60" />
                      </>
                    );
                  }
                  
                  // Fallback: 예고편 없으면 기존 Backdrop 이미지
                  if (movie.backdropUrl) {
                    return (
                      <>
                        <img
                          src={movie.backdropUrl}
                          alt={movie.title}
                          className="absolute inset-0 w-full h-full object-cover blur-sm"
                        />
                        {/* v7.2: 강화된 그라데이션 (텍스트 가독성) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-black/60" />
                      </>
                    );
                  }
                  
                  // Fallback: 둘 다 없으면 단색 배경
                  return <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/80 to-background" />;
                })()}


                {/* v7.4: Hero Content - 중앙 정렬 & 여백 확보 */}
                <div className="absolute bottom-0 left-0 right-0 py-10 px-8">
                  <div className="max-w-5xl mx-auto flex gap-8 items-end">
                    {/* v8.1: 포스터 (왼쪽 하단) - 높이 자동 조정 */}
                    <div className="flex-shrink-0 w-44 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 h-fit">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-auto object-cover mb-0"
                      />
                    </div>

                    {/* v7.10: Typography Hierarchy - 압도적 강약 조절 */}
                    <div className="flex-1 space-y-4 pb-2 mb-4">
                      {/* 메인 제목: 압도적 강조 (최대 2줄) */}
                      <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl line-clamp-2 overflow-hidden">
                        {movie.title}
                      </h1>

                      {/* 서브 제목: 투명도로 보조 역할 (1줄 제한) */}
                      {movie.originalTitle && movie.originalTitle !== movie.title && (
                        <p className="text-lg text-white/60 font-normal drop-shadow-lg truncate block">
                          {movie.originalTitle}
                        </p>
                      )}

                      {/* v8.1: 메타데이터 + 장르 태그 (한 줄로 통합) */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-white/70 font-normal">
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span>{movie.runtime}</span>
                        </div>
                        {genres.map((genre, idx) => (
                          <span
                            key={idx}
                            className="bg-transparent border border-slate-600 text-slate-300 rounded-full px-3 py-1 text-xs font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* v7.5: 액션 버튼 - 반투명 배경으로 덩어리감 강화 */}
                      <div className="flex gap-4 pt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleWishlist}
                          className="rounded-full bg-slate-800/60 border-white/30 hover:bg-slate-800/80 backdrop-blur-sm h-12 w-12 p-0 shadow-lg"
                          title="찜하기"
                        >
                          <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current text-red-500' : 'text-white'}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleWatched}
                          className="rounded-full bg-slate-800/60 border-white/30 hover:bg-slate-800/80 backdrop-blur-sm h-12 w-12 p-0 shadow-lg"
                          title="이미 봄"
                        >
                          <Popcorn className={`h-6 w-6 ${isWatched ? 'fill-current text-primary' : 'text-white'}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* v9.1: Content Section - 아코디언 레이아웃 복구 */}
              <div className="p-8 pt-6 space-y-4 pb-20 relative">
                {/* 배경 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/90 -z-10" />

                {/* 평점 + OTT 정보 */}
                <div className="space-y-4">
                  {/* TMDB + Friends Rating */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-xl">{movie.rating.toFixed(1)}</span>
                      <span className="text-xs font-bold text-yellow-400 border border-yellow-400 px-1.5 py-0.5 rounded">IMDb</span>
                      <span className="text-muted-foreground text-base">/10</span>
                    </div>

                    {isLoggedIn && movie.friendsRatingCount && movie.friendsRatingCount > 0 && (
                      <>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <Users className="h-6 w-6 text-primary" />
                          <span className="text-2xl font-bold text-foreground">{movie.friendsRating?.toFixed(1) || '0.0'}</span>
                          <span className="text-muted-foreground text-base">/10</span>
                          <span className="text-sm text-muted-foreground ml-1">({movie.friendsRatingCount}명)</span>
                        </div>
                      </>
                    )}
                    {isLoggedIn && (!movie.friendsRatingCount || movie.friendsRatingCount === 0) && (
                      <>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <Users className="h-6 w-6 text-muted-foreground/50" />
                          <span className="text-base text-muted-foreground">프렌즈 후기 없음</span>
                          <span className="text-sm text-primary ml-1">👇 첫 후기를 남겨보세요!</span>
                        </div>
                      </>
                    )}
                    {!isLoggedIn && (
                      <>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-2 opacity-50">
                          <Users className="h-6 w-6 text-muted-foreground" />
                          <span className="text-base text-muted-foreground">로그인 후 프렌즈 평점 확인</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* OTT Platforms */}
                  {movie.platforms && movie.platforms.length > 0 && (
                    <OTTPlatforms platforms={movie.platforms} />
                  )}
                </div>

                {/* v4.1: Image Gallery (3x3 Grid) */}
                {movie.images?.backdrops && movie.images.backdrops.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-foreground">GALLERY</h3>
                      <span className="text-sm text-muted-foreground">({movie.images.backdrops.length})</span>
                    </div>
                    <ImageGallery images={movie.images.backdrops} title={movie.title} />
                  </div>
                )}

                {/* v6.13: Quote Section (AI 한 줄 평 - 매거진 스타일) */}
                <blockquote className="pl-8 pr-8 py-6 bg-muted/30 rounded-lg relative">
                  <span className="absolute left-2 top-2 text-4xl text-yellow-500/20 font-serif">❝</span>
                  <p className="text-lg md:text-xl text-foreground italic leading-relaxed font-light tracking-wide">
                    {movie.oneLiner}
                  </p>
                  <span className="absolute right-2 bottom-2 text-4xl text-yellow-500/20 font-serif">❞</span>
                  <footer className="mt-4 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={friendlyAvatar} alt="OTT 친구" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <cite className="text-sm text-muted-foreground not-italic font-medium">— OTT 친구의 한 줄 평</cite>
                  </footer>
                </blockquote>

                {/* v4.3.2: 예고편 */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Play className="h-5 w-5 text-red-500" />
                    예고편
                  </h3>
                  {movie.trailerUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black/50">
                      <iframe
                        width="100%"
                        height="100%"
                        src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                        title="영화 예고편"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl overflow-hidden bg-card border border-border flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">예고편이 없습니다</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* v9.5: Accordion with Flex Gap - 단른 gap으로 절대적 여백 */}
                <Accordion type="multiple" defaultValue={["reviews"]} className="flex flex-col gap-8">
                  {/* Plot */}
                  <AccordionItem value="plot" className="border-0">
                    <AccordionTrigger className="bg-transparent border-b border-white/10 py-8 hover:no-underline text-left">
                      <div className="flex items-center gap-4">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span className="text-xl font-medium">그래서, 뭔 내용인데?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4">
                      <p className="text-base text-foreground leading-relaxed tracking-wide" style={{ lineHeight: '1.8' }}>
                        {movie.plot}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Global Reviews */}
                  <AccordionItem value="reviews" className="border-0">
                    <AccordionTrigger className="bg-transparent border-b border-white/10 py-8 hover:no-underline text-left">
                      <div className="flex items-center gap-4">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="text-xl font-medium">세계는 이 영화를 어떻게 봤어? </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-3">
                      {(() => {
                        console.log('[MovieOverlay Render] Checking reviews:', movie.reviews);
                        console.log('[MovieOverlay Render] Reviews length:', movie.reviews?.length);
                        return null;
                      })()}
                      {movie.reviews && movie.reviews.length > 0 ? (
                        movie.reviews.map((review: any, idx) => {
                          console.log(`[MovieOverlay Render] Review ${idx}:`, review);
                          const reviewText = typeof review === 'string' ? review : review?.content || JSON.stringify(review);
                          const reviewAuthor = typeof review === 'object' && review?.author ? review.author : null;
                          return (
                            <div key={idx} className="p-4 bg-muted rounded-lg border-l-4 border-primary/50 space-y-2">
                              {reviewAuthor && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-primary">{reviewAuthor[0].toUpperCase()}</span>
                                  </div>
                                  <span className="text-xs font-medium text-slate-400">{reviewAuthor}</span>
                                </div>
                              )}
                              <p className="text-sm text-foreground leading-relaxed" style={{ lineHeight: '1.7' }}>
                                {reviewText}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-muted-foreground">아직 등록된 글로벌 리뷰가 없어요. 😅</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cast */}
                  <AccordionItem value="cast" className="border-0">
                    <AccordionTrigger className="bg-transparent border-b border-white/10 py-8 hover:no-underline text-left">
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-xl font-medium">누가 나와?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {movie.cast.map((actor, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                            <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                              <img src={actor.photo} alt={actor.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{actor.name}</p>
                              <p className="text-xs text-slate-400 truncate">{actor.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* User Comments */}
                  <AccordionItem value="comments" className="border-0">
                    <AccordionTrigger className="bg-transparent border-b border-white/10 py-8 hover:no-underline text-left">
                      <div className="flex items-center gap-4">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="text-xl font-medium">우리 친구들 후기는? ✍️</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-4">
                      {!isLoggedIn ? (
                        /* 미로그인 상태: 로그인 안내 */
                        <div className="p-8 bg-muted/50 rounded-xl border-2 border-dashed border-border text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <MessageSquare className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-foreground">후기를 남기려면 로그인이 필요해요</h3>
                            <p className="text-sm text-muted-foreground">
                              Google 계정으로 로그인하고<br />
                              친구들과 영화 후기를 공유해보세요!
                            </p>
                          </div>
                          <Button 
                            onClick={async () => {
                              const result = await signInWithGoogle();
                              if (!result) {
                                toast({
                                  title: "❌ 로그인 실패",
                                  description: "Google 로그인에 실패했습니다. Supabase 설정을 확인해주세요.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="rounded-full"
                            size="lg"
                          >
                            <Users className="h-5 w-5 mr-2" />
                            Google로 로그인하기
                          </Button>
                        </div>
                      ) : (
                        /* 로그인 상태: 후기 작성 폼 */
                        <>
                          {/* Rating Selector */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">평점</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                                <button
                                  key={rating}
                                  onClick={() => setSelectedRating(rating)}
                                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all
                                    ${selectedRating === rating 
                                      ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                  {rating}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Review Input */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">후기</label>
                            <Textarea
                              placeholder="이 영화 어땠어? 친구들에게 추천해줘!"
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              className="min-h-[100px] resize-none"
                            />
                          </div>

                          <Button 
                            onClick={handleSubmitReview}
                            className="w-full rounded-full"
                          >
                            후기 등록
                          </Button>
                        </>
                      )}

                      {/* Reviews List */}
                      <div className="space-y-3 mt-6">
                        {reviews.length > 0 ? (
                          reviews.map((review, idx) => (
                            <div key={idx} className="p-4 bg-card rounded-xl border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">👤</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{review.author}</p>
                                    <p className="text-xs text-muted-foreground">{review.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                                  <Star className="h-4 w-4 text-primary fill-current" />
                                  <span className="text-sm font-bold text-primary">{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-sm text-foreground leading-relaxed">{review.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            아직 후기가 없어요. 첫 번째 후기를 남겨보세요!
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
}
