import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Sparkles } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

interface DiscoveryFeedProps {
  onMovieClick?: (movieId: number) => void;
}

export default function DiscoveryFeed({ onMovieClick }: DiscoveryFeedProps) {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscovery = async () => {
      try {
        // v3.35: 서버 API 사용 (Supabase 캐싱 적용)
        const [trendingRes, upcomingRes] = await Promise.all([
          fetch('/api/discovery/trending'),
          fetch('/api/discovery/upcoming')
        ]);

        const trendingData = await trendingRes.json();
        const upcomingData = await upcomingRes.json();

        setTrending(trendingData);
        setUpcoming(upcomingData);
      } catch (error) {
        console.error('Discovery feed error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscovery();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-background p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-44 flex-shrink-0 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-64 mt-8" />
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-44 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen bg-background">
      <div className="p-6 space-y-8 animate-in fade-in duration-300">
        {/* 트렌딩 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              🔥 지금 한국에서 가장 핫한 10편
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {trending.map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick?.(movie.id)}
                className="flex-shrink-0 group"
              >
                <div className="relative w-44 h-64 rounded-xl overflow-hidden bg-card transition-transform group-hover:scale-105">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {/* v3.33: Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground line-clamp-2 text-left">
                  {movie.title}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* 개봉 예정 섹션 */}
        <section className="animate-in fade-in duration-300 delay-150">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              🎬 이번 주 볼만한 신작
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {upcoming.map((movie) => (
              <button
                key={movie.id}
                onClick={() => onMovieClick?.(movie.id)}
                className="flex-shrink-0 group"
              >
                <div className="relative w-44 h-64 rounded-xl overflow-hidden bg-card transition-transform group-hover:scale-105">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {/* v3.33: Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground line-clamp-2 text-left">
                  {movie.title}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-card rounded-xl p-6 border border-card-border text-center animate-in fade-in duration-300 delay-300">
          <p className="text-muted-foreground mb-2">
            마음에 드는 영화를 찾으셨나요?
          </p>
          <p className="text-foreground font-medium">
            왼쪽 채팅창에서 AI 친구와 대화하며 더 많은 추천을 받아보세요! 💬
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
