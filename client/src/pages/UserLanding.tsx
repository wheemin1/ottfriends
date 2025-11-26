import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { ArrowUp, Menu } from "lucide-react";
import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface UserLandingProps {
  onSubmit: (text: string) => void;
  onNewChat: () => void;
}

export default function UserLanding({ onSubmit, onNewChat }: UserLandingProps) {
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  const handleChipClick = (message: string) => {
    setInputValue(message);
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* v10.0: Desktop Sidebar - Always Visible */}
      <div className="hidden md:block">
        <AppSidebar 
          onNewChat={onNewChat}
          onLoadSession={() => {}}
          currentSessionId=""
        />
      </div>

      {/* v10.0: Mobile Sidebar - Sheet Drawer */}
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

      {/* v10.0: Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* v10.0: Aurora Glow Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="absolute w-[500px] h-[500px] bg-gradient-radial from-primary/40 via-primary/20 to-transparent blur-3xl animate-pulse" 
               style={{ animationDuration: '4s' }} />
          <div className="absolute w-[400px] h-[400px] bg-gradient-radial from-blue-500/30 via-blue-500/10 to-transparent blur-3xl animate-pulse" 
               style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        {/* v10.0: Center Content */}
        <div className="w-full max-w-3xl text-center space-y-8 relative z-10">
          {/* v10.0: Hero Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            오늘 어떤 영화 볼래요?
          </h1>

          {/* v10.0: Hero Input - Large Pill Shape */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="예) 오늘 기분 좀 우울한데 뭐 볼까?"
              className="w-full h-16 px-6 pr-16 text-base rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              autoFocus
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </form>

          {/* v10.0: Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { label: "요즘 핫한거", message: "요즘 가장 핫한 영화 추천해줘" },
              { label: "우울할 때", message: "나 오늘 좀 우울해, 기분 전환할 영화 추천해줘" },
              { label: "로맨스", message: "설레는 로맨스 영화 보고 싶어" },
              { label: "스릴러", message: "긴장감 넘치는 스릴러 추천해줘" },
              { label: "주말 정주행", message: "주말에 정주행하기 좋은 시리즈물 추천해줘" }
            ].map((chip, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => handleChipClick(chip.message)}
                className="rounded-full px-4 py-2 text-sm bg-white/5 border border-white/10 text-slate-300 hover:bg-white/20 hover:border-white/30 transition-all"
              >
                {chip.label}
              </Button>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground/60 mt-8">
            AI 친구도 가끔은 실수할 수 있어요. 영화 정보는 한 번 더 확인해 주세요. 😊
          </p>
        </div>
      </div>
    </div>
  );
}
