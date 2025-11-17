import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import UsageStats from "./UsageStats";
import OTTFilter from "./OTTFilter";
import MovieGrid from "./MovieGrid";

interface MyPageProps {
  recommendations: { used: number; total: number };
  chats: { used: number; total: number };
  selectedPlatforms: string[];
  watchedMovies: any[];
  wishlistMovies: any[];
  onUpgrade: () => void;
  onPlatformsChange: (platforms: string[]) => void;
  onMovieClick: (movieId: string) => void;
}

export default function MyPage({
  recommendations,
  chats,
  selectedPlatforms,
  watchedMovies,
  wishlistMovies,
  onUpgrade,
  onPlatformsChange,
  onMovieClick
}: MyPageProps) {
  return (
    <ScrollArea className="h-screen bg-background" data-testid="my-page">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">마이페이지</h1>

        <UsageStats
          recommendations={recommendations}
          chats={chats}
          onUpgrade={onUpgrade}
        />

        <OTTFilter
          selected={selectedPlatforms}
          onChange={onPlatformsChange}
        />

        <Tabs defaultValue="watched" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="watched" className="rounded-xl" data-testid="tab-watched">
              🍿 이미 봄
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-xl" data-testid="tab-wishlist">
              💛 찜하기
            </TabsTrigger>
          </TabsList>
          <TabsContent value="watched" className="mt-6">
            <MovieGrid movies={watchedMovies} onMovieClick={onMovieClick} />
          </TabsContent>
          <TabsContent value="wishlist" className="mt-6">
            <MovieGrid movies={wishlistMovies} onMovieClick={onMovieClick} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
