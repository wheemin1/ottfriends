import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
  onSuggestionClick: (message: string) => void;
}

const suggestions = [
  { text: "요즘 뭐 볼만한 거 없어?", icon: "🎬" },
  { text: "나 오늘 좀 우울해 😔", icon: "💭" },
  { text: "영화 퀴즈 내줘!", icon: "🎯" }
];

export default function SuggestionChips({ onSuggestionClick }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion.text)}
          className="rounded-full whitespace-nowrap flex-shrink-0 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:text-yellow-400 transition-colors"
        >
          <span className="mr-1">{suggestion.icon}</span>
          {suggestion.text}
        </Button>
      ))}
    </div>
  );
}
