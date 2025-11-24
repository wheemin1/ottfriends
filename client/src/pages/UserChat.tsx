import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ChatInterface from "@/components/ChatInterface";
import MovieOverlay from "@/components/MovieOverlay";
import { useState } from "react";

interface UserChatProps {
  onNewChat: () => void;
  firstMessage?: string;
}

export default function UserChat({ onNewChat, firstMessage }: UserChatProps) {
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);

  const handleRecommendationClick = async (movieId: number) => {
    setIsLoadingMovie(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const response = await fetch(`/api/movie/${movieId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const movieData = await response.json();
      setSelectedMovie(movieData);
    } catch (error) {
      console.error('[회원챗] 영화 상세 정보 로드 실패:', error);
    } finally {
      setIsLoadingMovie(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="h-screen bg-background flex relative overflow-hidden">
        {/* v7.9: Fixed Aurora Background - 화면 전체에 고정 (스크롤/영역과 무관) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
              filter: 'blur(100px)'
            }}
          />
        </div>

        <AppSidebar 
          onNewChat={onNewChat}
          onLoadSession={() => {}}
          currentSessionId=""
        />

        {/* 채팅창 (영화 선택 시 사이드바 제외하고 50%, 기본 100%) */}
        <div className={`overflow-hidden transition-all duration-500 relative z-10 ${selectedMovie ? 'w-1/2' : 'flex-1'}`}>
          <ChatInterface 
            onMenuClick={() => {}}
            onPremiumClick={() => {}}
            onMyPageClick={() => {}}
            onPersonaClick={() => {}}
            onLoginClick={() => {}}
            onRecommendationClick={handleRecommendationClick}
            persona="friendly"
            isGuest={false}
            firstMessage={firstMessage}
          />
        </div>

        {/* 영화 상세 패널 (오른쪽 50%) */}
        <MovieOverlay
          open={!!selectedMovie}
          onClose={() => {
            setSelectedMovie(null);
            setIsLoadingMovie(false);
          }}
          movie={selectedMovie}
        />
      </div>
    </SidebarProvider>
  );
}
