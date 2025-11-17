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

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        className="flex-1 rounded-xl bg-card border-card-border"
        data-testid="input-chat"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !message.trim()}
        className="rounded-xl"
        data-testid="button-send"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
