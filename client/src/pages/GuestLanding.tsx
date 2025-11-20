import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Plus } from "lucide-react";
import { useState } from "react";

interface GuestLandingProps {
  onSubmit: (text: string) => void;
  onLoginClick: () => void;
}

export default function GuestLanding({ onSubmit, onLoginClick }: GuestLandingProps) {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showLoginTrap, setShowLoginTrap] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    if (input.value.trim()) {
      onSubmit(input.value);
    }
  };

  const handleLogin = async () => {
    const { signInWithGoogle } = await import("@/lib/supabase");
    await signInWithGoogle();
  };

  return (
    <div className="h-screen bg-background flex flex-col relative">
      {/* v5.8: Ambient Glow - 전체 배경 조명 효과 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* v5.8: Mini Sidebar - 투명 헤더 */}
      <header className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between z-20 bg-transparent">
        {/* Left: Logo + New Chat Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-lg">OTT 프렌즈</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLoginTrap(true)}
            className="rounded-lg gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 채팅</span>
          </Button>
        </div>

        {/* Right: Login Button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowLoginPopup(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          로그인
        </Button>
      </header>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div 
          className="w-full max-w-3xl mx-auto text-center space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Character */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-8xl"
          >
            🙂
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            오늘 어떤 영화 볼래요?
          </motion.h1>

          {/* Floating Input - ChatGPT Style */}
          <motion.div
            layoutId="input-container"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                placeholder="예) 오늘 기분 좀 우울한데 뭐 볼까?"
                className="w-full h-16 px-6 pr-16 text-lg rounded-3xl border-2 border-border/50 bg-background hover:border-primary/50 focus:border-primary shadow-2xl transition-all"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full h-12 w-12 shadow-md"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#F97316',
                  color: 'white',
                  zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA580C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>

          {/* v5.10: Suggestion Chips - 원클릭 스타트 UX */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-6"
          >
            {[
              { emoji: "🍿", label: "요즘 핫한거", message: "요즘 가장 핫한 영화 추천해줘" },
              { emoji: "😭", label: "우울할 때", message: "나 오늘 좀 우울해, 기분 전환할 영화 추천해줘" },
              { emoji: "❤️", label: "로맨스", message: "설레는 로맨스 영화 보고 싶어" },
              { emoji: "😱", label: "스릴러", message: "긴장감 넘치는 스릴러 추천해줘" }
            ].map((chip, i) => (
              <Button
                key={i}
                variant="ghost"
                size="lg"
                className="rounded-full px-6 py-2.5 text-base border border-border/40 hover:bg-accent hover:border-border transition-all"
                onClick={() => onSubmit(chip.message)}
              >
                <span className="mr-2">{chip.emoji}</span>
                {chip.label}
              </Button>
            ))}
          </motion.div>

          {/* v5.4: Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xs text-center text-muted-foreground/60 mt-4"
          >
            AI 친구도 가끔은 실수할 수 있어요. 영화 정보는 한 번 더 확인해 주세요. 😊
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
        <span className="mx-2">•</span>
        <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
      </footer>

      {/* Login Popup */}
      <AnimatePresence>
        {showLoginPopup && (
          <>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
              onClick={() => setShowLoginPopup(false)}
            />

            {/* Login Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-background border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={() => setShowLoginPopup(false)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">🎬</div>
                  <h1 className="text-3xl font-bold">OTT프렌즈에 로그인</h1>
                  <p className="text-muted-foreground">
                    대화 기록을 저장하고 맞춤 추천을 받으세요
                  </p>
                </div>

                <div className="space-y-4 mt-8">
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
                    onClick={() => setShowLoginPopup(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    게스트로 계속하기
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  로그인하면 <a href="#" className="underline">이용약관</a> 및 <a href="#" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* v5.2: Login Trap Modal - New Chat Button Trigger */}
      <AnimatePresence>
        {showLoginTrap && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
              onClick={() => setShowLoginTrap(false)}
            />

            {/* Login Trap Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-background border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                {/* Close Button */}
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
                    로그인
                  </Button>

                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="w-full h-12 text-base"
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
    </div>
  );
}
