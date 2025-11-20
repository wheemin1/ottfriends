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
    <form onSubmit={handleSubmit} className="relative w-full" style={{ position: 'relative' }}>
      <div className="relative w-full" style={{ position: 'relative' }}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={disabled}
          className="w-full h-14 pl-5 pr-16 text-base rounded-3xl border border-white/10 bg-slate-800/50 backdrop-blur-md hover:bg-slate-800/60 focus:bg-slate-800/70 focus:border-white/20 shadow-lg transition-all placeholder:text-slate-400"
          data-testid="input-chat"
          style={{ paddingRight: '4rem' }}
        />
        <Button
          type="button"
          size="icon"
          disabled={disabled || !message.trim()}
          onClick={handleButtonClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full h-10 w-10 disabled:opacity-50 shadow-md"
          data-testid="button-send"
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            zIndex: 10,
            backgroundColor: '#F97316',
            color: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA580C'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
        >
          <Send className="h-4 w-4 text-white" />
        </Button>
      </div>
    </form>
  );
}
