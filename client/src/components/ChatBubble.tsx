import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import friendlyAvatar from '@assets/generated_images/Friendly_AI_persona_avatar_ae12e60b.png';
import tsundereAvatar from '@assets/generated_images/Tsundere_AI_persona_avatar_c4f3ce45.png';

interface ChatBubbleProps {
  message: string;
  isAI: boolean;
  persona?: "friendly" | "tsundere";
  className?: string;
}

export default function ChatBubble({ message, isAI, persona = "friendly", className }: ChatBubbleProps) {
  const avatarSrc = persona === "friendly" ? friendlyAvatar : tsundereAvatar;
  const avatarEmoji = persona === "friendly" ? "☺️" : "😑";

  // v6.9.3: AI 텍스트 밝기 강화 (가독성 향상)
  if (isAI) {
    return (
      <div
        className={cn("flex w-full justify-start", className)}
        data-testid="bubble-ai"
      >
        <div className="flex gap-3 items-start max-w-[85%]">
          <div className="bg-transparent text-gray-100">
            <p className="text-base font-normal leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // v7.8: 사용자 메시지 - 고스트 스타일 (Ghost Style)
  return (
    <div
      className={cn("flex w-full justify-end", className)}
      data-testid="bubble-user"
    >
      <div className="flex gap-3 items-start max-w-[85%]">
        <div className="bg-white/10 border border-white/5 text-white px-6 py-4 rounded-2xl rounded-tr-sm shadow-lg">
          <p className="text-base font-normal leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <Avatar className="h-8 w-8 flex-shrink-0 bg-slate-700 border border-slate-600">
          <AvatarFallback className="text-white">👤</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
