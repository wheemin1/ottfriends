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

  return (
    <div
      className={cn(
        "flex gap-2 items-start",
        isAI ? "justify-start" : "justify-end",
        className
      )}
      data-testid={isAI ? "bubble-ai" : "bubble-user"}
    >
      {isAI && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={avatarSrc} alt="AI" />
          <AvatarFallback>{avatarEmoji}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-xl",
          isAI
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}
