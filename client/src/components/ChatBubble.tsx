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

  // v6.9.2: AI는 프로필 없이 텍스트만
  if (isAI) {
    return (
      <div
        className={cn("flex w-full justify-start", className)}
        data-testid="bubble-ai"
      >
        <div className="flex gap-3 items-start max-w-[85%]">
          <div className="bg-transparent text-slate-300">
            <p className="text-base font-normal leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // v6.9.2: 사용자 메시지 - 프로필과 말풍선 높이 정렬
  return (
    <div
      className={cn("flex w-full justify-end", className)}
      data-testid="bubble-user"
    >
      <div className="flex gap-3 items-start max-w-[85%]">
        <div className="bg-white/10 border border-white/10 text-white px-6 py-4 rounded-2xl rounded-tr-sm">
          <p className="text-base font-normal leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <Avatar className="h-8 w-8 flex-shrink-0 bg-slate-700 border border-slate-600">
          <AvatarFallback className="text-white">👤</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
