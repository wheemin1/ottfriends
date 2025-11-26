import { motion } from "framer-motion";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Send, Menu, ChevronLeft } from "lucide-react";
import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTypewriter } from "@/hooks/use-typewriter";

interface UserLandingProps {
  onSubmit: (text: string) => void;
  onNewChat: () => void;
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
}

const TYPING_PROMPTS = [
  "오늘 기분 좀 우울한데 뭐 볼까?",
  "주말에 정주행하기 좋은 시리즈물 추천해줘",
  "설레는 로맨스 영화 보고 싶어",
  "긴장감 넘치는 스릴러 추천해줘"
];

export default function UserLanding({ onSubmit, onNewChat, desktopSidebarOpen, setDesktopSidebarOpen }: UserLandingProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const typedText = useTypewriter(TYPING_PROMPTS, 80, 2500);
  const [isPremium, setIsPremium] = useState(false); // v21.0: Premium status

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handleChipClick = (message: string) => {
    setInputValue(message);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const form = inputRef.current.closest('form');
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true });
          form.dispatchEvent(submitEvent);
        }
      }
    }, 100);
  };

  // v21.0: 세션 로드 핸들러
  const handleLoadSession = (sessionId: string) => {
    const sessions = JSON.parse(localStorage.getItem('ottfriend_chat_sessions') || '[]');
    const session = sessions.find((s: any) => s.id === sessionId);
    
    if (session) {
      // 현재 세션 ID 설정
      localStorage.setItem('ottfriend_current_session', sessionId);
      
      // 채팅 히스토리 로드
      localStorage.setItem('ottfriend_chat_history', JSON.stringify(session.messages));
      
      // 채팅 시작 플래그 설정
      localStorage.setItem('ottfriend_chat_started', 'true');
      
      // ChatInterface에 세션 로드 이벤트 발생
      window.dispatchEvent(new Event('loadChatSession'));
      
      // 첫 메시지로 채팅 시작 (UserChat로 이동)
      onSubmit('');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900">
      {/* v11.0: Aurora Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* v18.0: Desktop Sidebar - Compact width (240px ↔ 64px) */}
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

      {/* v17.1: Logo outside sidebar */}
      <div className={`hidden md:flex fixed top-0 z-40 items-center transition-all duration-300 ease-in-out ${
        desktopSidebarOpen ? 'left-[12px]' : 'left-[80px]'
      } h-14 pointer-events-none`}>
        <span className="text-base font-bold text-white whitespace-nowrap tracking-wide">OTT 프렌즈</span>
      </div>

      {/* v11.0: Mobile Sidebar - Sheet Drawer */}
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

      {/* v11.2: Main Content Area - Flex-1 takes remaining space */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-8">
        {/* v11.0: Center Hero Section */}
        <div className="w-full max-w-3xl text-center space-y-8">
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            오늘 어떤 영화 볼래요?
          </motion.h1>

          {/* Hero Input with Typewriter Effect */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full"
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={typedText}
                className="w-full h-16 px-6 pr-16 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 text-white text-base placeholder:text-slate-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                autoFocus
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.form>

          {/* Suggestion Chips */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {[
              "요즘 핫한거",
              "우울할 때",
              "로맨스",
              "스릴러",
              "주말 정주행"
            ].map((label, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => {
                  const prompts: Record<string, string> = {
                    "요즘 핫한거": "요즘 가장 핫한 영화 추천해줘",
                    "우울할 때": "나 오늘 좀 우울해, 기분 전환할 영화 추천해줘",
                    "로맨스": "설레는 로맨스 영화 보고 싶어",
                    "스릴러": "긴장감 넘치는 스릴러 추천해줘",
                    "주말 정주행": "주말에 정주행하기 좋은 시리즈물 추천해줘"
                  };
                  handleChipClick(prompts[label]);
                }}
                className="rounded-full px-4 py-2 text-sm bg-white/5 border border-white/10 text-slate-300 hover:bg-white/20 hover:border-white/30 transition-all"
              >
                {label}
              </Button>
            ))}
          </motion.div>

          {/* Disclaimer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs text-muted-foreground/60"
          >
            AI 친구도 가끔은 실수할 수 있어요. 영화 정보는 한 번 더 확인해 주세요. 😊
          </motion.p>
        </div>
      </main>
    </div>
  );
}
