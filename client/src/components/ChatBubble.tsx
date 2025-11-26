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

  // v21.0: AI 메시지 - 투명 유리 질감 (GuestChat Sync)
  if (isAI) {
    return (
      <div
        className={cn("flex w-full justify-start", className)}
        data-testid="bubble-ai"
      >
        <div className="flex gap-3 items-start max-w-[85%]">
          <div className="bg-white/5 border border-white/10 text-slate-200 px-6 py-4 rounded-2xl rounded-tl-sm shadow-lg backdrop-blur-sm">
            <p className="text-base font-normal leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // v21.0: 사용자 메시지 - 은은한 보라/회색 틴트 (GuestChat Sync)
  return (
    <div
      className={cn("flex w-full justify-end", className)}
      data-testid="bubble-user"
    >
      <div className="flex gap-3 items-start max-w-[85%]">
        <div className="bg-slate-800/50 border border-white/10 text-slate-200 px-6 py-4 rounded-2xl rounded-tr-sm shadow-lg backdrop-blur-sm">
          <p className="text-base font-normal leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <Avatar className="h-8 w-8 flex-shrink-0 bg-slate-700 border border-slate-600">
          <AvatarFallback className="text-white">👤</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
