import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ChatBubble from "./ChatBubble";
import PillButton from "./PillButton";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import SuggestionChips from "./SuggestionChips";

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  recommendations?: Array<{
    id: number; // TMDB ID
    title: string;
    posterPath: string | null;
    voteAverage: number;
  }>;
}

interface ChatInterfaceProps {
  onMenuClick: () => void;
  onPremiumClick: () => void;
  onMyPageClick?: () => void;
  onPersonaClick?: () => void;
  onLoginClick?: () => void;
  onRecommendationClick?: (movieId: number) => void;
  persona?: "friendly" | "tsundere";
  quotaInfo?: {
    recommendations: { used: number; total: number };
    chats: { used: number; total: number };
  };
}

export default function ChatInterface({ onMenuClick, onPremiumClick, onMyPageClick, onPersonaClick, onLoginClick, onRecommendationClick, persona = "friendly", quotaInfo }: ChatInterfaceProps) {
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

  const handleSend = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, isAI: false };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    
    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: messages
            .filter(msg => msg.id !== '1') // 첫 AI 인사말 제외
            .map(msg => ({
              role: msg.isAI ? 'assistant' : 'user',
              parts: msg.text
            })),
          userConfig: {
            persona: persona === 'friendly' ? '다정한 친구' : '츠데레 친구',
            ott_filters: ['netflix', 'disney'],
            seen_list_tmdb_ids: [],
            taste_profile_titles: []
          }
        })
      });

      const data = await response.json();
      
      setIsTyping(false);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        isAI: true,
        recommendations: data.recommendations || undefined
      };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Chat API 오류:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '아, 잠깐 생각 좀 해볼게... 다시 한번 말해줄래?',
        isAI: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="chat-interface">
      {/* v3.18 Gemini-style Header: 왼쪽(탐색), 오른쪽(계정) */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background flex-shrink-0 shadow-sm">
        {/* 왼쪽: 탐색 영역 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-testid="button-menu"
            className="rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍿</span>
            <span className="font-semibold text-foreground text-lg hidden sm:inline">OTT 친구</span>
          </div>
        </div>
        
        {/* 오른쪽: 계정/액션 영역 */}
        <ChatHeader 
          onPremiumClick={onPremiumClick}
          onMyPageClick={onMyPageClick}
          onPersonaClick={onPersonaClick}
          onLoginClick={onLoginClick}
          quotaInfo={quotaInfo}
        />
      </header>

      {/* v3.19 Sticky Input FIX: 채팅 내용만 스크롤 */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <ChatBubble message={msg.text} isAI={msg.isAI} persona={persona} />
              {msg.recommendations && (
                <div className="flex gap-2 flex-wrap pl-10">
                  {msg.recommendations.map((rec, idx) => (
                    <PillButton
                      key={rec.id}
                      label={rec.title}
                      onClick={() => onRecommendationClick?.(rec.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* v3.19: 입력창 고정 */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        {/* v3.26b: 대화 시작 유도 버튼 (메시지가 적을 때만) */}
        {messages.length <= 2 && (
          <SuggestionChips onSuggestionClick={handleSend} />
        )}
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
