import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Heart, Popcorn, BookOpen, Globe, Users, MessageSquare, Star } from "lucide-react";
import MoviePoster from "./MoviePoster";
import OTTPlatforms from "./OTTPlatforms";
import DiscoveryFeed from "./DiscoveryFeed";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import friendlyAvatar from '@assets/generated_images/Friendly_AI_persona_avatar_ae12e60b.png';

interface DetailsPanelProps {
  movie?: {
    title: string;
    year: string;
    runtime: string;
    genre: string;
    rating: number;
    posterUrl: string;
    oneLiner: string;
    platforms: Array<{name: string, logoPath: string}>; // v3.39: TMDB 로고 직접 사용
    plot: string;
    reviews: string[];
    cast: { name: string; character: string; photo: string }[];
    friendsRating?: number; // v3.37: 프렌즈 평점 (사용자 평점 평균)
    friendsRatingCount?: number; // v3.37: 프렌즈 평점 개수
  };
  onClose?: () => void;
  onMovieClick?: (movieId: number) => void;
  isLoading?: boolean;
}

export default function DetailsPanel({ movie, onClose, onMovieClick, isLoading = false }: DetailsPanelProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Array<{rating: number, text: string, author: string, date: string}>>([]);
  const { toast } = useToast();

  console.log('[DetailsPanel] Render - isLoading:', isLoading, 'movie:', movie?.title || 'null');

  const handleSubmitReview = () => {
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

    // v3.38: 후기 추가
    const newReview = {
      rating: selectedRating,
      text: reviewText,
      author: '나', // 나중에 실제 사용자명으로 변경
      date: new Date().toLocaleDateString('ko-KR'),
    };

    setReviews([newReview, ...reviews]);
    setSelectedRating(null);
    setReviewText('');

    toast({
      title: "✅ 후기가 등록되었어요!",
      description: "친구들과 후기를 공유했습니다.",
    });
  };

  // v3.31b: PRIORITY 1 - Show skeleton during loading (prevent DiscoveryFeed flash)
  if (isLoading) {
    console.log('[DetailsPanel] Showing skeleton');
    return (
      <ScrollArea className="h-screen bg-background">
        <div className="p-6 space-y-6 relative">
          {/* Close button skeleton */}
          {onClose && (
            <div className="absolute top-4 right-4 z-10">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          )}

          {/* Poster skeleton */}
          <div className="w-full max-h-[400px] bg-background rounded-xl overflow-hidden flex items-center justify-center">
            <Skeleton className="w-full h-[400px] rounded-xl" />
          </div>

          {/* Title and meta skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/2" />

            {/* Buttons skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-full" />
              <Skeleton className="h-10 flex-1 rounded-full" />
            </div>

            {/* Rating skeleton - TMDB + Friends */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-6 w-px" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* OTT platforms skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>

            {/* One-liner skeleton */}
            <div className="border-l-4 border-primary pl-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6 mt-2" />
            </div>
          </div>

          {/* Accordion skeletons */}
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </ScrollArea>
    );
  }

  const handleWishlist = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    
    if (newState) {
      toast({
        title: "✅ 찜 목록에 추가했어요",
        description: `'${movie?.title}'를 찜했습니다.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWishlisted(false)}
          >
            실행 취소
          </Button>
        ),
        duration: 3000,
      });
    }
  };

  const handleWatched = () => {
    const newState = !isWatched;
    setIsWatched(newState);
    
    if (newState) {
      toast({
        title: "✅ '이미 봄' 목록에 추가했어요",
        description: `'${movie?.title}'는 다시 추천하지 않을게요.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWatched(false)}
          >
            실행 취소
          </Button>
        ),
        duration: 3000,
      });
    }
  };

  if (!movie) {
    return (
      <div className="animate-in fade-in duration-200">
        <DiscoveryFeed onMovieClick={onMovieClick} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-200 relative h-screen">
      <ScrollArea className="h-screen bg-background" data-testid="details-panel">
        <div className="p-6 space-y-6 relative">
        {/* v3.40: 닫기 버튼 (스켈레톤 UI와 같은 위치) */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background border border-border"
            data-testid="button-close-details"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        <div className="w-full max-h-[400px] bg-background rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-contain"
            style={{ maxHeight: '400px' }}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-movie-title">
            {movie.title}
          </h1>
          
          <p className="text-muted-foreground" data-testid="text-movie-meta">
            {movie.year} · {movie.runtime} · {movie.genre}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleWishlist}
              className="rounded-full flex-1"
              data-testid="button-wishlist"
            >
              <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current text-primary' : ''}`} />
              찜하기
            </Button>
            <Button
              variant="outline"
              onClick={handleWatched}
              className="rounded-full flex-1"
              data-testid="button-watched"
            >
              <Popcorn className={`h-4 w-4 mr-2 ${isWatched ? 'fill-current text-primary' : ''}`} />
              이미 봄
            </Button>
          </div>

          {/* v3.32: TMDB 평점 + 프렌즈 평점 */}
          <div className="flex items-center gap-6">
            {/* TMDB 평점 */}
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-current" />
              <span className="text-lg font-bold text-foreground">{movie.rating}</span>
              <span className="text-muted-foreground text-sm">/10</span>
            </div>

            {/* 구분선 */}
            <div className="h-6 w-px bg-border" />

            {/* v3.37: 프렌즈 평점 (실제 사용자 평균) */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {movie.friendsRating && movie.friendsRatingCount ? (
                <>
                  <span className="text-lg font-bold text-foreground">{movie.friendsRating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">/10</span>
                  <span className="text-xs text-muted-foreground ml-1">프렌즈 ({movie.friendsRatingCount}명)</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">평가 없음</span>
              )}
            </div>
          </div>

          <OTTPlatforms platforms={movie.platforms} />
          
          <p className="text-lg text-foreground italic border-l-4 border-primary pl-4">
            "{movie.oneLiner}"
          </p>
        </div>

        <Accordion type="multiple" className="space-y-3">
          <AccordionItem value="plot" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-plot">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">그래서, 뭔 내용인데?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4">
              <p className="text-muted-foreground leading-relaxed">{movie.plot}</p>
            </AccordionContent>
          </AccordionItem>

          {/* v3.36: 글로벌 후기 (TMDB API) */}
          <AccordionItem value="reviews" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-reviews">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium">다른 애들 생각은?</span>
                <span className="text-xs text-muted-foreground ml-auto mr-2">글로벌 후기</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-3">
              {movie.reviews && movie.reviews.length > 0 ? (
                movie.reviews.map((review, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">{review}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">아직 리뷰가 없어요</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cast" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-cast">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">누가 나오는데?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                {movie.cast.map((actor, idx) => (
                  <div key={idx} className="text-center">
                    <img src={actor.photo} alt={actor.name} className="w-full aspect-square object-cover rounded-xl mb-2" />
                    <p className="text-sm font-medium text-foreground">{actor.name}</p>
                    <p className="text-xs text-muted-foreground">{actor.character}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* v3.36c: 자체 후기 (적당한 디자인) */}
          <AccordionItem value="comments" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate border border-primary/20 flex items-center justify-between" data-testid="accordion-comments">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">우리 친구들 후기는?</span>
                <span className="text-xs text-muted-foreground ml-auto mr-2">OTT Friend</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              {/* v3.37: 평점 입력 */}
              <div className="space-y-3 p-4 bg-card rounded-xl border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">⭐ 평점을 남겨주세요</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => setSelectedRating(score)}
                        className={`flex-1 h-10 rounded-lg border transition-colors text-sm font-medium ${
                          selectedRating === score
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary hover:bg-primary/10'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">✍️ 후기를 남겨주세요</label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="이 영화 어땠어요? 친구들에게 후기를 남겨주세요!"
                    className="rounded-xl min-h-[100px]"
                    data-testid="textarea-comment"
                  />
                </div>

                <Button 
                  onClick={handleSubmitReview}
                  className="w-full rounded-xl" 
                  data-testid="button-submit-comment"
                >
                  추가하기
                </Button>
              </div>
              
              {/* v3.38: 후기 목록 */}
              <div className="space-y-3">
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
    </ScrollArea>
    </div>
  );
}
