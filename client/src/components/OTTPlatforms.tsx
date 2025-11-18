import { cn } from "@/lib/utils";

interface OTTPlatformsProps {
  platforms: Array<{name: string, logoPath: string}>;
  className?: string;
}

export default function OTTPlatforms({ platforms, className }: OTTPlatformsProps) {
  return (
    <div className={cn("flex gap-3 flex-wrap items-center", className)} data-testid="ott-platforms">
      {platforms && platforms.length > 0 ? (
        platforms.map((platform, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div className="h-12 px-4 py-2 bg-card rounded-lg flex items-center border border-border hover:border-primary/50 transition-colors">
              <img 
                src={platform.logoPath} 
                alt={platform.name} 
                className="h-full max-w-[120px] object-contain"
                onError={(e) => {
                  // 이미지 로드 실패 시 텍스트로 대체
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-sm font-medium text-foreground px-2">${platform.name}</span>`;
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{platform.name}</span>
          </div>
        ))
      ) : (
        <span className="text-sm text-muted-foreground">OTT 정보 없음</span>
      )}
    </div>
  );
}
