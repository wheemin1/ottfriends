import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  { text: "요즘 뭐 볼만한 거 없어?", icon: "🎬", label: "추천" },
  { text: "나 오늘 좀 우울해 😔", icon: "💭", label: "기분" },
  { text: "영화 퀴즈 내줘!", icon: "🎯", label: "퀴즈" }
];

export default function SuggestionChips({ onSuggestionClick }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion.text)}
          className="rounded-full flex-shrink-0 bg-transparent border border-white/20 text-slate-400 hover:bg-white/5 hover:border-white/30 hover:text-slate-200 transition-all duration-300 px-3 py-2 text-xs flex items-center gap-1.5"
        >
          <span>{suggestion.icon}</span>
          <span className="font-medium">{suggestion.label}</span>
        </button>
      ))}
    </div>
  );
}
