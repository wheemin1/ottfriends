import ChatInterface from "@/components/ChatInterface";

interface GuestChatProps {
  onMenuClick: () => void;
  onLoginClick: () => void;
}

export default function GuestChat({ onMenuClick, onLoginClick }: GuestChatProps) {
  return (
    <div className="h-screen bg-background">
      <ChatInterface 
        onMenuClick={onMenuClick}
        onPremiumClick={() => {}}
        onMyPageClick={onLoginClick}
        onPersonaClick={() => {}}
        onLoginClick={onLoginClick}
        onRecommendationClick={() => {}}
        persona="friendly"
        isGuest={true}
      />
    </div>
  );
}
