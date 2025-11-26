import { motion } from "framer-motion";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface UserLandingProps {
  onSubmit: (text: string) => void;
  onNewChat: () => void;
}

export default function UserLanding({ onSubmit, onNewChat }: UserLandingProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    if (input.value.trim()) {
      onSubmit(input.value);
      input.value = '';
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden relative">
      {/* v10.1: GuestLanding Aurora Glow - 전체 배경 조명 효과 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* v10.2: Desktop Sidebar - Collapsible */}
      {desktopSidebarOpen && (
        <div className="hidden md:block relative z-10">
          <AppSidebar 
            onNewChat={onNewChat}
            onLoadSession={() => {}}
            currentSessionId=""
            onToggleSidebar={() => setDesktopSidebarOpen(false)}
          />
        </div>
      )}

      {/* v10.2: Show Sidebar Button when collapsed */}
      {!desktopSidebarOpen && (
        <div className="hidden md:block fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDesktopSidebarOpen(true)}
            className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* v10.1: Mobile Sidebar - Sheet Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="p-0 w-[260px] bg-slate-950/95 backdrop-blur-xl border-white/5">
          <AppSidebar 
            onNewChat={() => {
              onNewChat();
              setSidebarOpen(false);
            }}
            onLoadSession={() => {}}
            currentSessionId=""
          />
        </SheetContent>
      </Sheet>

      {/* v10.1: Main Content - GuestLanding 디자인 시스템 적용 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div 
          className="w-full max-w-3xl mx-auto text-center space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* v10.1: Headline - GuestLanding 스타일 */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-200 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            오늘 어떤 영화 볼래요?
          </motion.h1>

          {/* v10.1: Hero Input - GuestLanding의 유리 질감 입력창 */}
          <motion.div
            layoutId="input-container"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                placeholder="예) 오늘 기분 좀 우울한데 뭐 볼까?"
                className="w-full h-16 px-6 pr-16 text-lg rounded-3xl border border-white/10 bg-slate-900 focus:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0 shadow-2xl transition-all placeholder:text-slate-500"
                autoFocus
                spellCheck={false}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white text-black hover:bg-slate-200 transition-all z-10 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>

          {/* v10.1: Suggestion Chips - GuestLanding 투명 알약 스타일 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-6"
          >
            {[
              { label: "요즘 핫한거", message: "요즘 가장 핫한 영화 추천해줘" },
              { label: "우울할 때", message: "나 오늘 좀 우울해, 기분 전환할 영화 추천해줘" },
              { label: "로맨스", message: "설레는 로맨스 영화 보고 싶어" },
              { label: "스릴러", message: "긴장감 넘치는 스릴러 추천해줘" }
            ].map((chip, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className="rounded-full px-3 py-1.5 text-xs bg-transparent border border-white/20 text-slate-400 hover:border-white/30 hover:text-slate-200 transition-all"
                onClick={() => onSubmit(chip.message)}
              >
                {chip.label}
              </Button>
            ))}
          </motion.div>

          {/* v10.1: Disclaimer */}
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
    </div>
  );
}
