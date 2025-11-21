import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface UserLandingProps {
  onSubmit: (text: string) => void;
  onNewChat: () => void;
}

export default function UserLanding({ onSubmit, onNewChat }: UserLandingProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    if (input.value.trim()) {
      onSubmit(input.value);
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

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-3xl text-center space-y-12">
            <h1 className="text-3xl font-medium text-slate-200">오늘 어떤 영화 볼래요?</h1>
            <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
              <Input
                type="text"
                placeholder="예) 오늘 기분 좀 우울한데 뭐 볼까?"
                className="w-full h-14 px-6 pr-16 text-base rounded-3xl border border-white/10 bg-slate-900 focus:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0 shadow-2xl transition-all placeholder:text-slate-500"
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

            {/* v5.10: Suggestion Chips - 원클릭 스타트 UX */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
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
            </div>

            {/* v5.4: Disclaimer */}
            <p className="text-xs text-center text-muted-foreground/60 mt-4">
              AI 친구도 가끔은 실수할 수 있어요. 영화 정보는 한 번 더 확인해 주세요. 😊
            </p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
