import { cn } from "@/lib/utils";

interface OTTPlatformsProps {
  platforms: Array<{name: string, logoPath: string}>;
  className?: string;
}

export default function OTTPlatforms({ platforms, className }: OTTPlatformsProps) {
  return (
    <div className={cn("flex gap-4 flex-wrap items-center", className)} data-testid="ott-platforms">
      {platforms && platforms.length > 0 ? (
        platforms.map((platform, idx) => (
          <div 
            key={idx} 
            className="h-16 px-5 py-3 bg-card rounded-xl flex items-center border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            title={platform.name}
          >
            <img 
              src={platform.logoPath} 
              alt={platform.name} 
              className="h-full max-w-[140px] object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                // 이미지 로드 실패 시 텍스트로 대체
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-base font-semibold text-foreground px-3">${platform.name}</span>`;
              }}
            />
          </div>
        ))
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🎬 아직 스트리밍 전이에요!</span>
        </div>
      )}
    </div>
  );
}
