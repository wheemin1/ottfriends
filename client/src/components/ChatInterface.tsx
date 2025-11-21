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
  isGuest?: boolean; // v4.8: 게스트 모드
  firstMessage?: string; // v5.1: 랜딩에서 입력한 첫 메시지
}

export default function ChatInterface({ onMenuClick, onPremiumClick, onMyPageClick, onPersonaClick, onLoginClick, onRecommendationClick, persona = "friendly", quotaInfo, isGuest = false, firstMessage }: ChatInterfaceProps) {
  // v4.8: 게스트는 localStorage 사용 안 함
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!isGuest) {
      const saved = localStorage.getItem('ottfriend_chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse chat history:', e);
        }
      }
      
      // 첫 방문 시 자동 세션 생성
      const currentSession = localStorage.getItem('ottfriend_current_session');
      if (!currentSession) {
        const newSessionId = `session_${Date.now()}`;
        localStorage.setItem('ottfriend_current_session', newSessionId);
      }
    }
    
    // v5.2: firstMessage가 있으면 초기 인사말 스킵
    if (firstMessage) {
      return [];
    }
    
    return [{ id: '1', text: '안녕! 오늘 기분이 어때?', isAI: true }];
  });
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<string | null>(null);

  // v4.8: 게스트 모드에서는 저장 안 함
  useEffect(() => {
    if (isGuest) return; // 게스트는 저장 스킵
    
    localStorage.setItem('ottfriend_chat_history', JSON.stringify(messages));
    
    // Save to session list
    const currentSessionId = localStorage.getItem('ottfriend_current_session');
    if (currentSessionId && messages.length > 1) {
      const sessions = JSON.parse(localStorage.getItem('ottfriend_chat_sessions') || '[]');
      const sessionIndex = sessions.findIndex((s: any) => s.id === currentSessionId);
      
      // Get title from first user message
      const firstUserMessage = messages.find(m => !m.isAI);
      const title = firstUserMessage ? firstUserMessage.text.slice(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '') : '새 대화';
      const preview = messages[messages.length - 1]?.text.slice(0, 50) || '';
      
      const sessionData = {
        id: currentSessionId,
        title,
        preview,
        timestamp: Date.now(),
        messages
      };
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = sessionData;
      } else {
        sessions.push(sessionData);
      }
      
      localStorage.setItem('ottfriend_chat_sessions', JSON.stringify(sessions));
      window.dispatchEvent(new Event('chatSessionsUpdated'));
    }
  }, [messages, isGuest]);

  // v5.1: 랜딩에서 넘어온 첫 메시지 저장
  useEffect(() => {
    if (firstMessage && !firstMessageRef.current) {
      firstMessageRef.current = firstMessage;
    }
  }, [firstMessage]);

  // v4.3: 세션 이벤트 리스너
  useEffect(() => {
    const handleNewSession = () => {
      setMessages([{ id: '1', text: '안녕! 오늘 기분이 어때?', isAI: true }]);
    };
    
    const handleLoadSession = () => {
      const saved = localStorage.getItem('ottfriend_chat_history');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load session:', e);
        }
      }
    };
    
    window.addEventListener('newChatSession', handleNewSession);
    window.addEventListener('loadChatSession', handleLoadSession);
    
    return () => {
      window.removeEventListener('newChatSession', handleNewSession);
      window.removeEventListener('loadChatSession', handleLoadSession);
    };
  }, []);

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

  // v5.1: 컴포넌트 마운트 후 firstMessage 처리
  useEffect(() => {
    if (firstMessageRef.current) {
      const message = firstMessageRef.current;
      firstMessageRef.current = null; // 한 번만 실행
      handleSend(message);
    }
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  return (
    <div className="h-full flex flex-col bg-transparent" data-testid="chat-interface">
      {/* v5.2: 게스트 모드에서는 헤더 숨김 (GuestChat이 자체 헤더 사용) */}
      {!isGuest && (
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
            <span className="font-semibold text-foreground text-lg hidden sm:inline">OTT 친구</span>
          </div>
        </div>
        
        {/* 오른쪽: 계정/액션 영역 */}
        <ChatHeader 
          onPremiumClick={onPremiumClick}
          onMyPageClick={onMyPageClick}
          onPersonaClick={onPersonaClick}
          onLoginClick={onLoginClick}
          isGuest={isGuest}
          quotaInfo={quotaInfo}
        />
        </header>
      )}

      {/* v5.5: Chat Content Area - ChatGPT Style (말풍선 너비 제한) */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <ChatBubble message={msg.text} isAI={msg.isAI} persona={persona} />
              {msg.recommendations && (
                <div className="flex gap-2 flex-wrap pl-11">
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

      {/* v5.3: Floating Input Area - ChatGPT Style */}
      <div className="flex-shrink-0 border-t border-border/30 bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* v3.26b: 대화 시작 유도 버튼 (메시지가 적을 때만) */}
          {messages.length <= 2 && (
            <div className="mb-3">
              <SuggestionChips onSuggestionClick={handleSend} />
            </div>
          )}
          <ChatInput onSend={handleSend} />
          
          {/* v5.4: Disclaimer - AI Accuracy Notice */}
          <p className="text-xs text-center text-muted-foreground/60 mt-3 leading-relaxed">
            AI 친구도 가끔은 실수할 수 있어요. 영화 정보는 한 번 더 확인해 주세요. 😊
          </p>
        </div>
      </div>
    </div>
  );
}
