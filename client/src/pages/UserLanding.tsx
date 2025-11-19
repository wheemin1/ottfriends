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
          <div className="w-full max-w-2xl text-center space-y-8">
            <div className="text-6xl">🙂</div>
            <h1 className="text-3xl font-bold">오늘 어떤 영화 볼래요?</h1>
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                placeholder="예) 오늘 기분 좀 우울한데 뭐 볼까?"
                className="w-full h-14 px-5 pr-12 text-base rounded-2xl border-2"
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
