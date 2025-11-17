import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import friendlyAvatar from '@assets/generated_images/Friendly_AI_persona_avatar_ae12e60b.png';
import tsundereAvatar from '@assets/generated_images/Tsundere_AI_persona_avatar_c4f3ce45.png';

interface PersonaSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PersonaSelector({ value, onChange }: PersonaSelectorProps) {
  const personas = [
    { id: "friendly", label: "다정한 I친구", emoji: "☺️", avatar: friendlyAvatar },
    { id: "tsundere", label: "츤데레 친구", emoji: "😑", avatar: tsundereAvatar }
  ];

  return (
    <div className="space-y-3" data-testid="persona-selector">
      <h3 className="text-sm font-medium text-foreground">🤖 친구 페르소나 설정</h3>
      <RadioGroup value={value} onValueChange={onChange}>
        {personas.map((persona) => (
          <div key={persona.id} className="flex items-center space-x-3 p-3 rounded-xl hover-elevate">
            <RadioGroupItem value={persona.id} id={persona.id} data-testid={`radio-${persona.id}`} />
            <Avatar className="h-10 w-10">
              <AvatarImage src={persona.avatar} alt={persona.label} />
              <AvatarFallback>{persona.emoji}</AvatarFallback>
            </Avatar>
            <Label htmlFor={persona.id} className="flex-1 cursor-pointer text-foreground">
              {persona.label} {persona.emoji}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
