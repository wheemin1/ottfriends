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

  // v5.5: ChatGPT 스타일 - 말풍선이 화면을 꽉 채우지 않도록 개선
  if (isAI) {
    // AI 메시지: 왼쪽 정렬, 아바타 + 말풍선
    return (
      <div
        className={cn("flex w-full justify-start", className)}
        data-testid="bubble-ai"
      >
        <div className="flex gap-3 items-end max-w-[85%]">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatarSrc} alt="AI" />
            <AvatarFallback>{avatarEmoji}</AvatarFallback>
          </Avatar>
          <div className="bg-muted/50 text-foreground px-6 py-4 rounded-2xl rounded-tl-sm">
            <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // v5.7: 사용자 메시지 - 심플 럭셔리 outline 스타일 + Typography 개선
  return (
    <div
      className={cn("flex w-full justify-end", className)}
      data-testid="bubble-user"
    >
      <div className="flex gap-3 items-end max-w-[85%]">
        <div className="bg-transparent border-2 border-slate-600 text-foreground px-6 py-4 rounded-2xl rounded-tr-sm">
          <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <Avatar className="h-8 w-8 flex-shrink-0 bg-slate-700 border border-slate-600">
          <AvatarFallback className="text-white">👤</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
