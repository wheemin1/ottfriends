import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Sparkles } from "lucide-react";

interface AppSidebarProps {
  onNewChat: () => void;
}

export default function AppSidebar({ onNewChat }: AppSidebarProps) {
  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent className="p-4">
        {/* v3.18 Gemini 스타일: 새 대화 + 채팅 기록만 */}
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

        {/* v4.0 예정: 채팅 기록 리스트 */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            최근 대화
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">
              채팅 기록 기능은<br />곧 추가될 예정입니다 🚀
            </p>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
