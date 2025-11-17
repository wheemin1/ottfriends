import { cn } from "@/lib/utils";

interface PillButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function PillButton({ label, onClick, className }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full border border-muted-foreground/40",
        "bg-transparent text-foreground text-sm",
        "hover-elevate active-elevate-2 transition-all duration-300",
        className
      )}
      data-testid={`pill-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {label}
    </button>
  );
}
