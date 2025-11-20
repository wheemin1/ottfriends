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
      <div className="h-screen bg-background flex">
        <AppSidebar 
          onNewChat={onNewChat}
          onLoadSession={() => {}}
          currentSessionId=""
        />

        {/* 채팅창 (영화 선택 시 사이드바 제외하고 50%, 기본 100%) */}
        <div className={`overflow-hidden transition-all duration-500 ${selectedMovie ? 'w-1/2' : 'flex-1'}`}>
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
