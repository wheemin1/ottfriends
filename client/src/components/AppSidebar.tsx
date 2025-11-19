import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Sparkles, MessageSquare, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  preview: string;
}

interface AppSidebarProps {
  onNewChat: () => void;
  onLoadSession?: (sessionId: string) => void;
  currentSessionId?: string;
}

export default function AppSidebar({ onNewChat, onLoadSession, currentSessionId }: AppSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      const savedSessions = localStorage.getItem('ottfriend_chat_sessions');
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          setSessions(parsed.sort((a: ChatSession, b: ChatSession) => b.timestamp - a.timestamp));
        } catch (e) {
          console.error('Failed to parse chat sessions:', e);
        }
      }
    };

    loadSessions();
    // Listen for storage changes
    window.addEventListener('storage', loadSessions);
    // Custom event for same-tab updates
    window.addEventListener('chatSessionsUpdated', loadSessions);
    
    return () => {
      window.removeEventListener('storage', loadSessions);
      window.removeEventListener('chatSessionsUpdated', loadSessions);
    };
  }, []);

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('ottfriend_chat_sessions', JSON.stringify(updated));
    setSessions(updated);
    
    // If deleting current session, clear chat
    if (sessionId === currentSessionId) {
      localStorage.removeItem('ottfriend_chat_history');
      localStorage.removeItem('ottfriend_current_session');
      window.dispatchEvent(new Event('chatSessionsUpdated'));
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return new Date(timestamp).toLocaleDateString('ko-KR');
  };

  const groupSessions = () => {
    const now = Date.now();
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const thisWeek: ChatSession[] = [];
    const older: ChatSession[] = [];

    sessions.forEach(session => {
      const diff = now - session.timestamp;
      const days = Math.floor(diff / 86400000);

      if (days === 0) today.push(session);
      else if (days === 1) yesterday.push(session);
      else if (days < 7) thisWeek.push(session);
      else older.push(session);
    });

    return { today, yesterday, thisWeek, older };
  };

  const { today, yesterday, thisWeek, older } = groupSessions();

  const renderSessionGroup = (title: string, sessionList: ChatSession[]) => {
    if (sessionList.length === 0) return null;

    return (
      <SidebarGroup className="mt-4">
        <SidebarGroupLabel className="text-xs text-muted-foreground">
          {title}
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-2">
          <SidebarMenu>
            {sessionList.map(session => (
              <SidebarMenuItem key={session.id}>
                <div className="relative group w-full">
                  <SidebarMenuButton
                    onClick={() => onLoadSession?.(session.id)}
                    className={`w-full justify-start ${
                      currentSessionId === session.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(session.timestamp)}</p>
                      </div>
                    </div>
                  </SidebarMenuButton>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent className="p-4">
        {/* v4.3: 새 대화 시작 버튼 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onNewChat} 
                  className="w-full justify-start rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" 
                  data-testid="button-new-chat"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  새 대화 시작
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* v4.3: 채팅 기록 리스트 */}
        {renderSessionGroup('💬 오늘', today)}
        {renderSessionGroup('💬 어제', yesterday)}
        {renderSessionGroup('💬 이번 주', thisWeek)}
        {renderSessionGroup('💬 이전', older)}

        {sessions.length === 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                아직 대화 기록이 없어요<br />
                위 버튼으로 시작해보세요! 🚀
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
