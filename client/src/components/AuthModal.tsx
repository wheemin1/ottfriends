import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Brain } from "lucide-react";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'login' | 'newChat'; // v6.2: 시나리오 구분
}

export default function AuthModal({ open, onOpenChange, variant = 'login' }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // v6.2: 대화 내용을 localStorage에 저장 (복귀 시 복원용)
      const chatMessages = sessionStorage.getItem('chat-messages');
      if (chatMessages) {
        localStorage.setItem('pre-auth-messages', chatMessages);
      }

      const { signInWithGoogle } = await import("@/lib/supabase");
      await signInWithGoogle();
      
      // 로그인 성공 시 모달 닫기
      onOpenChange(false);
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // v6.2: 시나리오별 문구
  const content = {
    login: {
      icon: null,
      title: "OTT 프렌즈에 로그인",
      description: "대화 기록을 저장하고 맞춤 추천을 받으세요.",
      mainButton: "Google로 계속하기",
      showSignupButton: false
    },
    newChat: {
      icon: <Brain className="h-12 w-12 text-primary mx-auto mb-4" />,
      title: "내 영화 취향 저장하고 계속하기",
      description: "로그인하면 대화 기록을 저장하고 더 똑똑한 추천을 받을 수 있어요.",
      mainButton: "Google 로그인",
      showSignupButton: true
    }
  };

  const current = content[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8"
        onPointerDownOutside={(e) => {
          // v6.2: 바깥 클릭 시 새로고침 방지
          e.preventDefault();
          onOpenChange(false);
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-slate-400" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="space-y-3">
          {/* 아이콘 (newChat일 때만) */}
          {current.icon}
          
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {current.title}
          </DialogTitle>
          <p className="text-sm text-slate-400 text-center">
            {current.description}
          </p>
        </DialogHeader>

        <div className="mt-8 space-y-3">
          {/* Google 로그인 버튼 (메인) - v6.12 애플 스타일 화이트 */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-white hover:bg-gray-100 text-black rounded-xl flex items-center justify-center gap-3 transition-all shadow-md font-medium text-lg disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? '로그인 중...' : current.mainButton}
          </button>

          {/* 나중에 하기 버튼 */}
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full text-sm text-slate-400 hover:text-slate-300"
          >
            나중에 하기
          </Button>
        </div>

        {/* 안내 문구 */}
        <p className="mt-6 text-xs text-center text-slate-500">
          로그인하면 <span className="text-slate-400">이용약관</span> 및 <span className="text-slate-400">개인정보처리방침</span>에 동의하게 됩니다.
        </p>
      </DialogContent>
    </Dialog>
  );
}
