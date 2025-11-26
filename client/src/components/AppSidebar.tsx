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
    <div className="w-[260px] h-screen flex flex-col bg-slate-950/50 backdrop-blur-xl border-r border-white/5">
      {/* v12.0: Header - Logo + Collapse Button (ChatGPT Structure) */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <span className="font-bold text-lg text-white">OTT 프렌즈</span>
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* v12.1: New Chat Button (Below Header) - Transparent border style */}
      <div className="px-4 py-4 border-b border-white/5">
        <Button
          onClick={onNewChat}
          className="w-full h-10 justify-start gap-2 bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-xl font-medium transition-all"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-semibold">새 채팅</span>
        </Button>
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

      {/* v10.4: User Profile - Enhanced Clickable Card */}
      <div className="mt-auto border-t border-white/5 bg-gradient-to-t from-slate-950/40 to-transparent">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-4 flex items-center gap-3 hover:bg-white/10 active:bg-white/15 transition-all justify-start rounded-none group"
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-sm text-white font-semibold block truncate group-hover:text-white transition-colors">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}
                </span>
                <span className="text-xs text-slate-400 block truncate group-hover:text-slate-300 transition-colors">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align="end" 
            className="w-[240px] bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 transition-colors">
              <Settings className="h-4 w-4 mr-2" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 transition-colors"
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
