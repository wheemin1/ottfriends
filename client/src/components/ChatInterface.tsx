import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Crown } from "lucide-react";
import ChatBubble from "./ChatBubble";
import PillButton from "./PillButton";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  recommendations?: string[];
}

interface ChatInterfaceProps {
  onMenuClick: () => void;
  onPremiumClick: () => void;
  onRecommendationClick?: (rec: string) => void;
}

export default function ChatInterface({ onMenuClick, onPremiumClick, onRecommendationClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '안녕! 오늘 기분이 어때?', isAI: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, isAI: false };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '좋아! 그럼 이런 작품들은 어때?',
        isAI: true,
        recommendations: ['인터스텔라', '기생충', '어벤져스: 엔드게임']
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="chat-interface">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onPremiumClick}
          className="rounded-full"
          data-testid="button-premium-header"
        >
          <Crown className="h-4 w-4 mr-1" />
          프리미엄
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <ChatBubble message={msg.text} isAI={msg.isAI} />
              {msg.recommendations && (
                <div className="flex gap-2 flex-wrap pl-4">
                  {msg.recommendations.map((rec, idx) => (
                    <PillButton
                      key={idx}
                      label={rec}
                      onClick={() => onRecommendationClick?.(rec)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
