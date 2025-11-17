import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Cloud, Sparkles } from "lucide-react";
import PersonaSelector from "./PersonaSelector";

interface AppSidebarProps {
  persona: string;
  onPersonaChange: (persona: string) => void;
  onLoginClick: () => void;
  onNewChat: () => void;
}

export default function AppSidebar({ persona, onPersonaChange, onLoginClick, onNewChat }: AppSidebarProps) {
  return (
    <Sidebar data-testid="app-sidebar">
      <SidebarContent className="p-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel>계정</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
              onClick={onLoginClick}
              data-testid="button-login"
            >
              <Cloud className="mr-2 h-4 w-4" />
              내 기록 백업/로그인
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupContent>
            <PersonaSelector value={persona} onChange={onPersonaChange} />
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewChat} className="w-full" data-testid="button-new-chat">
                  <Sparkles className="mr-2 h-4 w-4" />
                  새 대화 시작
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
