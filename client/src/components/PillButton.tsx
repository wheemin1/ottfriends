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
        "px-4 py-2 rounded-full border-2 border-slate-600",
        "bg-transparent text-foreground text-sm font-medium",
        "hover:bg-slate-800 hover:text-white hover:border-slate-700",
        "active:scale-95 transition-all duration-200",
        className
      )}
      data-testid={`pill-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {label}
    </button>
  );
}
