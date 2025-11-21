import { cn } from "@/lib/utils";

interface OTTPlatformsProps {
  platforms: Array<{name: string, logoPath: string}>;
  className?: string;
}

export default function OTTPlatforms({ platforms, className }: OTTPlatformsProps) {
  return (
    <div className={cn("flex gap-6 flex-wrap items-center", className)} data-testid="ott-platforms">
      {platforms && platforms.length > 0 ? (
        platforms.map((platform, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
            <img 
              src={platform.logoPath} 
              alt={platform.name}
              className="h-12 max-w-[120px] object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform"
              onError={(e) => {
                // 이미지 로드 실패 시 텍스트로 대체
                const span = document.createElement('span');
                span.className = 'text-base font-semibold text-foreground px-4 py-2 bg-slate-800 rounded-lg';
                span.textContent = platform.name;
                e.currentTarget.replaceWith(span);
              }}
            />
            <span className="text-xs text-slate-400 font-medium">{platform.name}</span>
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
