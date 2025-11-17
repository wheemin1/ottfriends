import netflixLogo from '@assets/generated_images/Netflix_logo_282cce44.png';
import disneyLogo from '@assets/generated_images/Disney_Plus_logo_0bbd4268.png';
import { cn } from "@/lib/utils";

interface OTTPlatformsProps {
  platforms: string[];
  className?: string;
}

export default function OTTPlatforms({ platforms, className }: OTTPlatformsProps) {
  const platformLogos: Record<string, string> = {
    netflix: netflixLogo,
    disney: disneyLogo,
  };

  return (
    <div className={cn("flex gap-2 flex-wrap", className)} data-testid="ott-platforms">
      {platforms.map((platform) => (
        <div key={platform} className="h-8 px-3 py-1 bg-card rounded-lg flex items-center">
          {platformLogos[platform] ? (
            <img src={platformLogos[platform]} alt={platform} className="h-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">{platform}</span>
          )}
        </div>
      ))}
    </div>
  );
}
