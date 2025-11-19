/**
 * v4.3: Magazine-Style Movie Details Panel
 * 오른쪽 패널에서 서서히 slide-in, 풀-블리드 백드롭 배경
 * Parasite 매거진 UI 스타일 구현
 */

import { useEffect, useState } from "react";
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Array<{rating: number, text: string, author: string, date: string}>>([]);
  const [currentMovieId, setCurrentMovieId] = useState<number | undefined>(undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // v4.3.1: 영화 전환 감지 및 애니메이션 (useEffect로 무한 루프 방지)
  useEffect(() => {
    if (movie?.id !== currentMovieId && movie?.id !== undefined) {
      if (currentMovieId !== undefined) {
        // 기존 영화에서 새 영화로 전환
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentMovieId(movie.id);
          setIsTransitioning(false);
        }, 300); // fade out 시간
      } else {
        // 첫 로드
        setCurrentMovieId(movie.id);
      }
    }
  }, [movie?.id, currentMovieId]);

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
    <div 
      className={`fixed right-0 top-0 bottom-0 w-1/2 bg-background border-l border-border shadow-2xl z-50
        transition-transform duration-500 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <ScrollArea className="h-full">
        <div 
          className={`relative min-h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        >{/* v4.3.1: 영화 전환 시 스르륵 fade 효과 */}
              {/* v4.1: Full-Bleed Hero Section with Backdrop */}
              <div className="relative w-full h-[60vh] overflow-hidden">
                {/* Backdrop Image */}
                {movie.backdropUrl ? (
                  <>
                    <img
                      src={movie.backdropUrl}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-background" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/80 to-background" />
                )}

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-6 left-6 z-30 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* IMDb Rating Badge (우상단) */}
                <div className="absolute top-6 right-6 z-20">
                  <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full bg-yellow-500 backdrop-blur-sm border-4 border-yellow-400/40 shadow-2xl">
                    <span className="text-3xl font-black text-black">{movie.rating.toFixed(1)}</span>
                    <span className="text-xs text-black/80 font-bold tracking-wide">IMDb</span>
                  </div>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex gap-6 items-end">
                    {/* 포스터 (왼쪽 하단) */}
                    <div className="flex-shrink-0 w-44 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>

                    {/* 제목 + 정보 (포스터 오른쪽) */}
                    <div className="flex-1 space-y-3 pb-2">
                      {/* 영문 제목 */}
                      <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
                        {movie.originalTitle || movie.title}
                      </h1>

                      {/* 한글 제목 */}
                      {movie.originalTitle && movie.originalTitle !== movie.title && (
                        <p className="text-2xl text-white/95 font-semibold drop-shadow-lg">
                          {movie.title}
                        </p>
                      )}

                      {/* 메타데이터 */}
                      <div className="flex items-center gap-4 text-base text-white/80 font-medium">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span>{movie.runtime}</span>
                      </div>

                      {/* 액션 버튼 (아이콘 전용) */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleWishlist}
                          className="rounded-full bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-sm"
                          title="천하기"
                        >
                          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : 'text-white'}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleWatched}
                          className="rounded-full bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-sm"
                          title="이미 봄"
                        >
                          <Popcorn className={`h-5 w-5 ${isWatched ? 'fill-current text-primary' : 'text-white'}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 space-y-8 bg-[#0f172a] min-h-screen">
                {/* 장르 태그 */}
                <div className="flex gap-2 flex-wrap">
                  {genres.map((genre, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="px-4 py-2 text-sm font-medium bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>

                {/* 평점 + OTT 정보 */}
                <div className="space-y-4">
                  {/* TMDB + Friends Rating */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold text-foreground">{movie.rating}</span>
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

                {/* v4.3: Quote Section (AI 한 줄 평 - 매거진 스타일) */}
                <blockquote className="border-l-4 border-primary pl-8 py-6 bg-muted/30 rounded-r-lg relative">
                  <span className="absolute -left-3 top-4 text-6xl text-primary/30 font-serif">"</span>
                  <p className="text-2xl md:text-3xl text-foreground italic leading-relaxed font-light tracking-wide">
                    {movie.oneLiner}
                  </p>
                  <span className="absolute -right-2 bottom-2 text-6xl text-primary/30 font-serif">"</span>
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

                {/* Accordions */}
                <Accordion type="multiple" className="space-y-3">
                  {/* Plot */}
                  <AccordionItem value="plot" className="border-0">
                    <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span className="font-medium">그래서, 뭔 내용인데?</span>
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
                    <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-medium">세계는 이 영화를 어떻게 봤어?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4 space-y-3">
                      {movie.reviews.map((review, idx) => (
                        <div key={idx} className="p-4 bg-muted rounded-lg border-l-4 border-primary/50">
                          <p className="text-sm text-foreground leading-relaxed" style={{ lineHeight: '1.7' }}>
                            {review}
                          </p>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cast */}
                  <AccordionItem value="cast" className="border-0">
                    <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-medium">누가 나와?</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {movie.cast.map((actor, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={actor.photo} alt={actor.name} />
                              <AvatarFallback>{actor.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{actor.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* User Comments */}
                  <AccordionItem value="comments" className="border-0">
                    <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <span className="font-medium">친구들 후기</span>
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
            </div>
        </ScrollArea>
      </div>
  );
}
