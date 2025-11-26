import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserConfigProvider } from "@/contexts/UserConfigContext";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import GuestLanding from "@/pages/GuestLanding";
import GuestChat from "@/pages/GuestChat";
import UserLanding from "@/pages/UserLanding";
import UserChat from "@/pages/UserChat";
import type { User } from "@supabase/supabase-js";

function Router() {
  // v4.8: 완전히 분리된 게스트/유저 컴포넌트
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const { toast } = useToast();

  // 로그인 여부 확인 및 auth state 리스너
  useEffect(() => {
    // 초기 사용자 확인
    getCurrentUser().then(user => {
      setIsLoggedIn(!!user);
      // 로그인 유저만 채팅 기록 복원
      if (user) {
        const chatStarted = localStorage.getItem('ottfriend_chat_started') === 'true';
        setIsChatStarted(chatStarted);
        setShowLoginPage(false);
      }
    });

    // 인증 상태 변경 리스너
    import("@/lib/supabase").then(({ onAuthStateChange }) => {
      const { data } = onAuthStateChange((user: any) => {
        setIsLoggedIn(!!user);
        if (user) {
          // 로그인 성공 시
          setShowLoginPage(false);
          const chatStarted = localStorage.getItem('ottfriend_chat_started') === 'true';
          setIsChatStarted(chatStarted);
          toast({
            title: "환영합니다!",
            description: "로그인에 성공했습니다.",
          });
        } else {
          // 로그아웃 시
          setIsChatStarted(false);
          localStorage.removeItem('ottfriend_chat_started');
        }
      });

      return () => {
        data?.subscription?.unsubscribe();
      };
    });
  }, [toast]);

  const handleStartChat = (message: string) => {
    // 로그인 유저만 localStorage에 저장
    if (isLoggedIn) {
      localStorage.setItem('ottfriend_chat_started', 'true');
    }
    setIsChatStarted(true);
    setInputValue(message);
  };

  const handleNewChat = () => {
    // v21.0: Safe Reset - 저장 후 초기화 프로세스
    if (isLoggedIn) {
      // 1. 현재 세션이 자동 저장되도록 이벤트 트리거 (ChatInterface의 useEffect가 처리)
      // 2. 히스토리 목록 갱신 이벤트 발생
      window.dispatchEvent(new Event('chatSessionsUpdated'));
      
      // 3. 현재 대화 내역 완전 삭제 (새 대화는 빈 상태로 시작)
      localStorage.removeItem('ottfriend_chat_history');
      
      // 4. 현재 활성 세션 ID 제거 (새 대화 준비)
      localStorage.removeItem('ottfriend_current_session');
      
      // 5. 채팅 상태 플래그 제거
      localStorage.removeItem('ottfriend_chat_started');
      
      // 6. 새 세션 시작 이벤트 발생 (ChatInterface가 초기화)
      window.dispatchEvent(new Event('newChatSession'));
    }
    
    // 7. UI 상태 초기화 (랜딩으로 이동)
    setIsChatStarted(false);
    setInputValue("");
  };

  const handleSidebarToggle = () => {
    if (!isLoggedIn) {
      toast({
        title: "로그인이 필요해요",
        description: "대화 기록을 저장하려면 로그인해주세요.",
      });
      setShowLoginPage(true);
    }
  };

  const handleLogin = async () => {
    toast({
      title: "로그인 진행 중",
      description: "Google 계정으로 로그인합니다.",
    });
    const { signInWithGoogle } = await import("@/lib/supabase");
    await signInWithGoogle();
    // onAuthStateChange 리스너가 자동으로 상태 업데이트
  };

  // 로그인 페이지 표시
  if (showLoginPage) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md p-8 space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="text-6xl">🎬</div>
            <h1 className="text-3xl font-bold">OTT프렌즈에 로그인</h1>
            <p className="text-muted-foreground">
              대화 기록을 저장하고 맞춤 추천을 받으세요
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </Button>

            <Button
              onClick={() => setShowLoginPage(false)}
              variant="ghost"
              className="w-full"
            >
              게스트로 계속하기
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            로그인하면 <a href="#" className="underline">이용약관</a> 및 <a href="#" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </motion.div>
      </div>
    );
  }

  // v4.8 Pure Start: 완전히 분리된 컴포넌트 사용
  if (isLoggedIn) {
    return isChatStarted ? (
      <UserChat 
        onNewChat={handleNewChat} 
        firstMessage={inputValue}
        desktopSidebarOpen={desktopSidebarOpen}
        setDesktopSidebarOpen={setDesktopSidebarOpen}
      />
    ) : (
      <UserLanding
        onSubmit={handleStartChat}
        onNewChat={handleNewChat}
        desktopSidebarOpen={desktopSidebarOpen}
        setDesktopSidebarOpen={setDesktopSidebarOpen}
      />
    );
  }

  // 게스트 모드
  return isChatStarted ? (
    <GuestChat
      onMenuClick={handleSidebarToggle}
      onLoginClick={() => setShowLoginPage(true)}
      firstMessage={inputValue}
    />
  ) : (
    <GuestLanding
      onSubmit={handleStartChat}
      onLoginClick={() => setShowLoginPage(true)}
    />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserConfigProvider>
        <TooltipProvider>
          <div className="h-full overflow-hidden">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </UserConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
