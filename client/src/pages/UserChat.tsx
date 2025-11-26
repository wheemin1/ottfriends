import AppSidebar from "@/components/AppSidebar";
import ChatInterface from "@/components/ChatInterface";
import MovieOverlay from "@/components/MovieOverlay";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftOpen, Trash2 } from "lucide-react";

interface UserChatProps {
  onNewChat: () => void;
  firstMessage?: string;
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
}

export default function UserChat({ onNewChat, firstMessage, desktopSidebarOpen, setDesktopSidebarOpen }: UserChatProps) {
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState<string>("새 대화");
  const [isPremium, setIsPremium] = useState(false); // v21.0: Premium status

  // v21.0: 현재 세션 제목 로드
  useEffect(() => {
    const currentSessionId = localStorage.getItem('ottfriend_current_session');
    if (currentSessionId) {
      const sessions = JSON.parse(localStorage.getItem('ottfriend_chat_sessions') || '[]');
      const currentSession = sessions.find((s: any) => s.id === currentSessionId);
      if (currentSession) {
        setChatTitle(currentSession.title);
      }
    }

    // 세션 업데이트 이벤트 리스너
    const handleSessionUpdate = () => {
      const sessionId = localStorage.getItem('ottfriend_current_session');
      if (sessionId) {
        const sessions = JSON.parse(localStorage.getItem('ottfriend_chat_sessions') || '[]');
        const session = sessions.find((s: any) => s.id === sessionId);
        if (session) {
          setChatTitle(session.title);
        }
      }
    };

    window.addEventListener('chatSessionsUpdated', handleSessionUpdate);
    return () => window.removeEventListener('chatSessionsUpdated', handleSessionUpdate);
  }, []);

  // v21.0: 세션 로드 핸들러
  const handleLoadSession = (sessionId: string) => {
    const sessions = JSON.parse(localStorage.getItem('ottfriend_chat_sessions') || '[]');
    const session = sessions.find((s: any) => s.id === sessionId);
    
    if (session) {
      // 현재 세션 ID 설정
      localStorage.setItem('ottfriend_current_session', sessionId);
      
      // 채팅 히스토리 로드
      localStorage.setItem('ottfriend_chat_history', JSON.stringify(session.messages));
      
      // 제목 업데이트
      setChatTitle(session.title);
      
      // ChatInterface에 세션 로드 이벤트 발생
      window.dispatchEvent(new Event('loadChatSession'));
    }
  };

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
    <div className="flex h-screen w-full overflow-hidden bg-slate-900">
      {/* v19.0: Aurora Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* v19.0: Desktop Sidebar - Compact width (240px ↔ 64px) */}
      <div className={`hidden md:block flex-none relative z-10 transition-all duration-300 ease-in-out overflow-hidden ${
        desktopSidebarOpen ? 'w-[240px]' : 'w-[64px]'
      }`}>
        <AppSidebar 
          onNewChat={onNewChat}
          onLoadSession={handleLoadSession}
          currentSessionId={localStorage.getItem('ottfriend_current_session') || ''}
          onToggleSidebar={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          isCollapsed={!desktopSidebarOpen}
        />
      </div>

      {/* v21.0: Logo outside sidebar - Above header */}
      <div className={`hidden md:flex fixed top-0 items-center transition-all duration-300 ease-in-out ${
        desktopSidebarOpen ? 'left-[12px]' : 'left-[80px]'
      } h-14 pointer-events-none`} style={{ zIndex: 60 }}>
        <span className="text-base font-bold text-white whitespace-nowrap tracking-wide">OTT 프렌즈</span>
      </div>

      {/* v19.0: Mobile Sidebar - Sheet Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent 
          side="left" 
          className="p-0 w-[260px] bg-slate-950/95 backdrop-blur-xl border-white/5"
          aria-describedby="sidebar-description"
        >
          <span id="sidebar-description" className="sr-only">
            채팅 히스토리 및 사용자 프로필을 포함한 사이드바 메뉴
          </span>
          <AppSidebar 
            onNewChat={() => {
              onNewChat();
              setMobileOpen(false);
            }}
            onLoadSession={(sessionId) => {
              handleLoadSession(sessionId);
              setMobileOpen(false);
            }}
            currentSessionId={localStorage.getItem('ottfriend_current_session') || ''}
          />
        </SheetContent>
      </Sheet>

      {/* v21.0: Chat Content Area with Minimal Glass Header */}
      <main className={`flex-1 relative flex flex-col overflow-hidden transition-all duration-300 ${selectedMovie ? 'w-1/2' : ''}`}>
        {/* v21.0: Minimal Glass Header - Sticky Top */}
        <header className="sticky top-0 z-50 h-14 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex-shrink-0">
          {/* Center: Chat Title */}
          <h1 className="font-bold text-sm text-slate-200 truncate max-w-[200px] sm:max-w-md">
            {chatTitle}
          </h1>

          {/* Right: Action Buttons - Absolute positioning */}
          <div className="absolute right-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('이 대화를 삭제하시겠습니까?')) {
                  onNewChat();
                }
              }}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="대화 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat Interface - Now fills remaining space */}
        <div className="flex-1 overflow-hidden">
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
            hideHeader={true}
          />
        </div>
      </main>

      {/* v19.0: Movie Detail Panel */}
      <div className={`transition-all duration-300 overflow-hidden ${selectedMovie ? 'w-1/2 relative z-20' : 'w-0'}`}>
        <MovieOverlay
          open={!!selectedMovie}
          onClose={() => {
            setSelectedMovie(null);
            setIsLoadingMovie(false);
          }}
          movie={selectedMovie}
        />
      </div>
    </div>
  );
}
