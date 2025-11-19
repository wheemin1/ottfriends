import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X } from "lucide-react";
import { useState } from "react";

interface GuestLandingProps {
  onSubmit: (text: string) => void;
  onLoginClick: () => void;
}

export default function GuestLanding({ onSubmit, onLoginClick }: GuestLandingProps) {
  const [showLoginPopup, setShowLoginPopup] = useState(false);

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
      {/* Transparent Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-foreground">OTT프렌즈</div>
        <Button variant="ghost" size="sm" onClick={() => setShowLoginPopup(true)}>
          로그인
        </Button>
      </header>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
        <motion.div 
          className="w-full max-w-3xl mx-auto text-center space-y-10"
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

          {/* Morphing Input */}
          <motion.div
            layoutId="input-container"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                placeholder="예) 오늘 기분 좀 우울한데 뭐 볼까?"
                className="w-full h-16 px-6 pr-14 text-lg rounded-3xl border-2 border-input hover:border-primary/50 focus:border-primary shadow-xl transition-colors"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl h-12 w-12"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>

          {/* Suggestion Chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { emoji: "🍿", text: "요즘 핫한거" },
              { emoji: "😭", text: "우울할 때" },
              { emoji: "❤️", text: "로맨스" },
              { emoji: "😱", text: "스릴러" }
            ].map((chip, i) => (
              <Button
                key={i}
                variant="outline"
                size="lg"
                className="rounded-full px-6 py-3 text-base hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  if (input) {
                    input.value = chip.text;
                    input.focus();
                  }
                }}
              >
                <span className="mr-2">{chip.emoji}</span>
                {chip.text}
              </Button>
            ))}
          </motion.div>
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
    </div>
  );
}
