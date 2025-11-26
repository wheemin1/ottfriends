import { Plus, MessageSquare, Settings, LogOut, PanelLeftClose, PanelLeftOpen, User, MessageSquareDashed, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import LimitReachedDialog from "./LimitReachedDialog";

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
  isCollapsed?: boolean;
}

export default function AppSidebar({ onNewChat, onLoadSession, currentSessionId, onToggleSidebar, onLogout, isCollapsed = false }: AppSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const { toast } = useToast();

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

  // v21.0: 새 채팅 생성 제한 체크
  const handleNewChatClick = () => {
    const FREE_LIMIT = 3;
    const PREMIUM_LIMIT = 10;
    const maxSessions = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

    if (sessions.length >= maxSessions) {
      setShowLimitDialog(true);
      return;
    }

    onNewChat();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout?.();
  };

  // v21.0: 채팅방 이름 변경
  const handleRenameSession = (sessionId: string, currentTitle: string) => {
    const newTitle = prompt('새 제목을 입력하세요', currentTitle);
    if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
      const updatedSessions = sessions.map(session =>
        session.id === sessionId ? { ...session, title: newTitle.trim() } : session
      );
      localStorage.setItem('ottfriend_chat_sessions', JSON.stringify(updatedSessions));
      window.dispatchEvent(new Event('chatSessionsUpdated'));
    }
  };

  // v21.0: 채팅방 삭제 확인 다이얼로그 열기
  const handleDeleteClick = (session: ChatSession) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  // v21.0: 채팅방 삭제 실행
  const handleConfirmDelete = () => {
    if (!sessionToDelete) return;

    const updatedSessions = sessions.filter(session => session.id !== sessionToDelete.id);
    localStorage.setItem('ottfriend_chat_sessions', JSON.stringify(updatedSessions));
    
    // 현재 세션이 삭제된 경우 랜딩으로 이동
    if (currentSessionId === sessionToDelete.id) {
      localStorage.removeItem('ottfriend_current_session');
      window.dispatchEvent(new CustomEvent('newChatSession'));
    }
    
    // 세션 목록 업데이트 이벤트 발생
    window.dispatchEvent(new Event('chatSessionsUpdated'));
    
    // 성공 토스트 표시
    toast({
      title: "대화 삭제 완료",
      description: `"${sessionToDelete.title}"이(가) 삭제되었습니다.`,
      duration: 3000,
    });
    
    // 다이얼로그 닫기
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
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
    <div className={`transition-all duration-300 ease-in-out h-screen flex flex-col overflow-hidden bg-slate-950/60 backdrop-blur-xl border-r border-white/5 ${
      isCollapsed ? 'w-[64px]' : 'w-[240px]'
    }`}>
      {/* v21.0: Top Header - Fixed (flex-none) */}
      <div className="flex-none">
        {/* Toggle Button */}
        <div className={`h-14 flex items-center justify-between pr-2 border-b border-white/5 transition-all duration-300`}>
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all flex-shrink-0 ml-auto"
              title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* New Chat Button */}
        <div className={`h-14 flex items-center transition-all duration-300 ${
          isCollapsed ? 'px-2 justify-center' : 'px-2'
        }`}>
          <Button
            onClick={handleNewChatClick}
            className={`transition-all duration-300 bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 font-medium flex-shrink-0 ${
              isCollapsed
                ? 'w-10 h-10 p-0 justify-center gap-0 rounded-full'
                : 'w-full h-10 justify-start gap-2 rounded-xl'
            }`}
            title={isCollapsed ? '새 채팅' : undefined}
          >
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span className={`text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}>새 채팅</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5"></div>
      </div>

      {/* v21.0: Middle History - Flexible & Scrollable (flex-1 overflow-y-auto) */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'hidden' : ''
      }`}>
        <div className="space-y-2 py-2 px-2 min-h-0">
          {/* Today Group */}
          {today.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-medium">오늘</p>
              </div>
              {today.map(session => (
                <div key={session.id} className="group relative flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => onLoadSession?.(session.id)}
                    className={`flex-1 justify-start text-left transition-colors ${
                      currentSessionId === session.id 
                        ? 'bg-white/15 text-white' 
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm">{session.title}</span>
                  </Button>
                  
                  {/* v21.0: 채팅방 설정 메뉴 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end"
                      className="w-[180px] bg-slate-950/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-xl p-2"
                    >
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameSession(session.id, session.title);
                        }}
                        className="px-3 py-2.5 text-sm text-slate-200 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10"
                      >
                        <Edit2 className="h-4 w-4 mr-3 text-slate-300" />
                        이름 변경
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session);
                        }}
                        className="px-3 py-2.5 text-sm text-red-400 rounded-lg cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                <div key={session.id} className="group relative flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => onLoadSession?.(session.id)}
                    className={`flex-1 justify-start text-left transition-colors ${
                      currentSessionId === session.id 
                        ? 'bg-white/15 text-white' 
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate text-sm">{session.title}</span>
                  </Button>
                  
                  {/* v21.0: 채팅방 설정 메뉴 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end"
                      className="w-[180px] bg-slate-950/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-xl p-2"
                    >
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameSession(session.id, session.title);
                        }}
                        className="px-3 py-2.5 text-sm text-slate-200 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10"
                      >
                        <Edit2 className="h-4 w-4 mr-3 text-slate-300" />
                        이름 변경
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session);
                        }}
                        className="px-3 py-2.5 text-sm text-red-400 rounded-lg cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="px-3 py-12 flex flex-col items-center justify-center h-32">
              <MessageSquareDashed className="h-8 w-8 text-slate-600 mb-3" />
              <p className="text-sm text-slate-600">
                아직 대화 기록이 없어요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* v21.0: Bottom Profile - Fixed (flex-none) */}
      <div className="flex-none border-t border-white/5 bg-gradient-to-t from-slate-950/40 to-transparent transition-all duration-300">
        {/* v21.0: Usage Meter */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">저장된 대화</span>
              <span className={`text-xs font-semibold ${
                sessions.length >= (isPremium ? 10 : 3) ? 'text-red-400' : 'text-slate-400'
              }`}>
                {sessions.length} / {isPremium ? '10' : '3'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  sessions.length >= (isPremium ? 10 : 3)
                    ? 'bg-red-500'
                    : sessions.length >= (isPremium ? 8 : 2)
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${(sessions.length / (isPremium ? 10 : 3)) * 100}%` }}
              />
            </div>
            {sessions.length >= (isPremium ? 10 : 3) && (
              <button className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                ⚡ 업그레이드
              </button>
            )}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`transition-all duration-300 hover:bg-white/10 active:bg-white/15 rounded-none group w-full ${
                isCollapsed
                  ? 'py-3 px-2 flex items-center justify-center gap-0'
                  : 'p-3 flex items-center gap-3 justify-start'
              }`}
              title={isCollapsed ? 'Profile' : undefined}
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/10 group-hover:ring-white/20 transition-all flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold truncate group-hover:text-white transition-colors">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자'}
                    </span>
                    {!isPremium && (
                      <span className="px-2 py-0.5 text-[10px] text-slate-300 bg-white/10 border border-white/5 rounded-full flex-shrink-0">
                        Basic
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block truncate group-hover:text-slate-300 transition-colors mt-0.5">
                    {user?.email}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align="start" 
            sideOffset={8}
            className="w-[220px] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-2"
          >
            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 transition-colors rounded-lg px-3 py-2.5 text-sm">
              <Settings className="h-5 w-5 mr-3 text-slate-300" />
              <span className="text-slate-200">설정</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10 transition-colors rounded-lg px-3 py-2.5 text-sm mt-1"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* v21.0: Limit Reached Dialog */}
      <LimitReachedDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        isPremium={isPremium}
        onUpgrade={() => {
          // TODO: 프리미엄 업그레이드 페이지로 이동
          console.log('프리미엄 업그레이드');
        }}
      />

      {/* v21.0: Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-white">
              대화 삭제
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-base">
              {sessionToDelete && (
                <>
                  "<span className="font-medium text-white">{sessionToDelete.title}</span>" 대화를 삭제하시겠습니까?
                  <br />
                  <span className="text-sm text-slate-400 mt-2 block">이 작업은 되돌릴 수 없습니다.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-200 hover:bg-white/10">
              취소
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
