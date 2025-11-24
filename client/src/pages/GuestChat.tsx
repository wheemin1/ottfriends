import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovieOverlay from "@/components/MovieOverlay";
import AuthModal from "@/components/AuthModal";

interface GuestChatProps {
  onMenuClick: () => void;
  onLoginClick: () => void;
  firstMessage?: string;
}

export default function GuestChat({ onMenuClick, onLoginClick, firstMessage }: GuestChatProps) {
  const [showLoginTrap, setShowLoginTrap] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authVariant, setAuthVariant] = useState<'login' | 'newChat'>('login');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);

  const handleRecommendationClick = async (movieId: number) => {
    // v6.15: 로딩 시작 (이전 영화는 유지하여 패널이 닫히지 않게)
    setIsLoadingMovie(true);
    
    try {
      const response = await fetch(`/api/movie/${movieId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const movieData = await response.json();
      setSelectedMovie(movieData);
    } catch (error) {
      console.error('[게스트챗] 영화 상세 정보 로드 실패:', error);
    } finally {
      setIsLoadingMovie(false);
    }
  };

  return (
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

      {/* 채팅창 (영화 선택 시 50%, 기본 100%) */}
      <div className={`h-screen flex flex-col relative z-10 transition-all duration-500 ${selectedMovie ? 'w-1/2' : 'w-full'}`}>
        {/* v7.9: Transparent Glass Header - 오로라가 비치도록 */}
        <header className="flex-none px-4 py-3 flex items-center justify-between backdrop-blur-md bg-transparent border-b border-white/5">
        {/* Left: Logo + New Chat */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-lg">OTT 프렌즈</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAuthVariant('newChat');
              setShowAuthModal(true);
            }}
            className="rounded-lg gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 채팅</span>
          </Button>
        </div>

        {/* Right: Login + Signup Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAuthVariant('login');
              setShowAuthModal(true);
            }}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            로그인
          </button>
          <button
            onClick={() => {
              setAuthVariant('login');
              setShowAuthModal(true);
            }}
            className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            회원가입
          </button>
        </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
          onMenuClick={onMenuClick}
          onPremiumClick={() => {}}
          onMyPageClick={onLoginClick}
          onPersonaClick={() => {}}
          onLoginClick={onLoginClick}
          onRecommendationClick={handleRecommendationClick}
          persona="friendly"
          isGuest={true}
          firstMessage={firstMessage}
          />
        </div>
      </div>

      {/* v5.2: Login Trap Modal */}
      <AnimatePresence>
        {showLoginTrap && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
              onClick={() => setShowLoginTrap(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-background border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={() => setShowLoginTrap(false)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">🧠</div>
                  <h1 className="text-3xl font-bold">내 영화 취향 저장하고 계속하기</h1>
                  <p className="text-muted-foreground text-lg">
                    로그인하면 대화 기록을 저장하고,<br />
                    더 똑똑한 추천을 받을 수 있어요
                  </p>
                </div>

                <div className="space-y-4 mt-8">
                  <Button
                    onClick={() => {
                      setShowLoginTrap(false);
                      setAuthVariant('newChat');
                      setShowAuthModal(true);
                    }}
                    className="w-full h-12 text-base bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    로그인
                  </Button>

                  <Button
                    onClick={() => {
                      setShowLoginTrap(false);
                      setAuthVariant('newChat');
                      setShowAuthModal(true);
                    }}
                    variant="outline"
                    className="w-full h-12 text-base border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all"
                    size="lg"
                  >
                    회원가입
                  </Button>

                  <Button
                    onClick={() => setShowLoginTrap(false)}
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground"
                  >
                    나중에 하기
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 영화 상세 패널 (오른쪽 50%) */}
      <MovieOverlay
        open={!!selectedMovie || isLoadingMovie}
        onClose={() => {
          setSelectedMovie(null);
          setIsLoadingMovie(false);
        }}
        movie={selectedMovie}
      />

      {/* v6.2: 로그인 모달 */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        variant={authVariant}
      />
    </div>
  );
}
