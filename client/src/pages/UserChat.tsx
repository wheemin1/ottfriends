import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ChatInterface from "@/components/ChatInterface";

interface UserChatProps {
  onNewChat: () => void;
}

export default function UserChat({ onNewChat }: UserChatProps) {
  return (
    <SidebarProvider>
      <div className="h-screen bg-background flex">
        <AppSidebar 
          onNewChat={onNewChat}
          onLoadSession={() => {}}
          currentSessionId=""
        />

        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            onMenuClick={() => {}}
            onPremiumClick={() => {}}
            onMyPageClick={() => {}}
            onPersonaClick={() => {}}
            onLoginClick={() => {}}
            onRecommendationClick={() => {}}
            persona="friendly"
            isGuest={false}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
