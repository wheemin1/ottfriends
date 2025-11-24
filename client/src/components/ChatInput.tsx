import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        className="w-full h-14 px-6 pr-16 text-base rounded-full border border-white/10 bg-slate-800/50 backdrop-blur-xl focus:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0 shadow-2xl transition-all duration-300 placeholder:text-slate-500"
        data-testid="input-chat"
        spellCheck={false}
      />
      <button
        type="button"
        disabled={disabled || !message.trim()}
        onClick={handleButtonClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10 flex items-center justify-center"
        data-testid="button-send"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
