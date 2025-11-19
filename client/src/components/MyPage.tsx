import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn, User } from "lucide-react";
import { getCurrentUser, signInWithGoogle, signOut, onAuthStateChange } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
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
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  // 사용자 인증 상태 확인 및 리스너 등록
  useEffect(() => {
    // 인증 상태 변경 리스너 (로그인/로그아웃 시 자동 업데이트)
    const { data } = onAuthStateChange((currentUser: any) => {
      console.log('Auth state changed:', currentUser); // 디버깅용
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });

    // 초기 사용자 확인
    getCurrentUser().then((currentUser) => {
      console.log('Initial user:', currentUser); // 디버깅용
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });

    // 클린업
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result) {
      toast({
        title: "❌ 로그인 실패",
        description: "Google 로그인에 실패했습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ 로그인 성공",
        description: "환영합니다!",
      });
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result) {
      setUser(null);
      setIsLoggedIn(false);
      // v4.8: 로그아웃 시 채팅 상태도 초기화
      localStorage.removeItem('ottfriend_chat_started');
      toast({
        title: "로그아웃 완료",
        description: "다음에 또 만나요!",
      });
      // 랜딩 페이지로 돌아가기
      window.location.reload();
    }
  };

  return (
    <ScrollArea className="h-screen bg-background" data-testid="my-page">
      <div className="p-6 space-y-6">
        {/* Header with Login/Logout */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">마이페이지</h1>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  로그아웃
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleLogin}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Google 로그인
            </Button>
          )}
        </div>

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
