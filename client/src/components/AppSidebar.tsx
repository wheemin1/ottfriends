import { Plus, MessageSquare, Settings, LogOut, PanelLeftClose, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

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
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}

export default function AppSidebar({ onNewChat, onLoadSession, currentSessionId, onToggleSidebar, onLogout }: AppSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [user, setUser] = useState<any>(null);

  // Load user info
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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
    window.addEventListener('storage', loadSessions);
    window.addEventListener('chatSessionsUpdated', loadSessions);
    
    return () => {
      window.removeEventListener('storage', loadSessions);
      window.removeEventListener('chatSessionsUpdated', loadSessions);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout?.();
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
    const last7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    sessions.forEach(session => {
      const diff = now - session.timestamp;
      const days = Math.floor(diff / 86400000);

      if (days === 0) today.push(session);
      else if (days < 7) last7Days.push(session);
      else older.push(session);
    });

    return { today, last7Days, older };
  };

  const { today, last7Days, older } = groupSessions();

  return (
    <div className="w-[260px] h-screen flex flex-col bg-slate-950/60 backdrop-blur-xl border-r border-white/5">
      {/* v10.3: Header - Frosted Glass Style */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Button
            onClick={onNewChat}
            className="flex-1 justify-center gap-2 bg-white text-black hover:bg-slate-200 rounded-full font-medium shadow-lg shadow-white/5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">새 채팅</span>
          </Button>
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* v10.0: History List with ScrollArea */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-2">
          {/* Today Group */}
          {today.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-medium">오늘</p>
              </div>
              {today.map(session => (
                <Button
                  key={session.id}
                  variant="ghost"
                  onClick={() => onLoadSession?.(session.id)}
                  className={`w-full justify-start text-left transition-colors ${
                    currentSessionId === session.id 
                      ? 'bg-white/15 text-white' 
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm">{session.title}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Last 7 Days Group */}
          {last7Days.length > 0 && (
            <div className="space-y-1 mt-4">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-medium">지난 7일</p>
              </div>
              {last7Days.map(session => (
                <Button
                  key={session.id}
                  variant="ghost"
                  onClick={() => onLoadSession?.(session.id)}
                  className={`w-full justify-start text-left transition-colors ${
                    currentSessionId === session.id 
                      ? 'bg-white/15 text-white' 
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm">{session.title}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                아직 대화 기록이 없어요
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* v10.3: User Profile - Frosted Glass Footer */}
      <div className="mt-auto border-t border-white/5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors justify-start rounded-none"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm text-white font-medium block truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}
                </span>
                <span className="text-xs text-slate-300 block truncate">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-[240px]">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-400 focus:text-red-400"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
