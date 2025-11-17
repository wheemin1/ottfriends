import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import netflixLogo from '@assets/generated_images/Netflix_logo_282cce44.png';
import disneyLogo from '@assets/generated_images/Disney_Plus_logo_0bbd4268.png';

interface OTTFilterProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
}

export default function OTTFilter({ selected, onChange }: OTTFilterProps) {
  const platforms = [
    { id: "netflix", name: "넷플릭스", logo: netflixLogo },
    { id: "disney", name: "디즈니+", logo: disneyLogo },
  ];

  const togglePlatform = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(p => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3" data-testid="ott-filter">
      <h3 className="text-sm font-medium text-foreground">구독 중인 OTT</h3>
      <div className="flex gap-2 flex-wrap">
        {platforms.map((platform) => (
          <Button
            key={platform.id}
            variant={selected.includes(platform.id) ? "default" : "outline"}
            onClick={() => togglePlatform(platform.id)}
            className="rounded-full h-10 px-4"
            data-testid={`filter-${platform.id}`}
          >
            <img src={platform.logo} alt={platform.name} className="h-5 mr-2" />
            {platform.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
