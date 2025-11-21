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
        "px-4 py-2 rounded-full",
        "bg-slate-800 text-slate-300 text-sm font-medium",
        "border border-slate-600",
        "hover:bg-slate-700",
        "active:scale-95 transition-all duration-200 shadow-sm",
        className
      )}
      data-testid={`pill-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {label}
    </button>
  );
}
