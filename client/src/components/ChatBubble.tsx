import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  isAI: boolean;
  className?: string;
}

export default function ChatBubble({ message, isAI, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        isAI ? "justify-start" : "justify-end",
        className
      )}
      data-testid={isAI ? "bubble-ai" : "bubble-user"}
    >
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
