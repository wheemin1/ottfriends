import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface UsageStatsProps {
  recommendations: { used: number; total: number };
  chats: { used: number; total: number };
  onUpgrade: () => void;
}

export default function UsageStats({ recommendations, chats, onUpgrade }: UsageStatsProps) {
  return (
    <Card className="rounded-xl" data-testid="usage-stats">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-lg">사용 현황</CardTitle>
        <Button onClick={onUpgrade} size="sm" className="rounded-full" data-testid="button-upgrade">
          <Crown className="h-4 w-4 mr-1" />
          업그레이드
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">추천 세트</span>
            <span className="text-foreground font-medium">{recommendations.used}/{recommendations.total}회</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(recommendations.used / recommendations.total) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">AI 잡담</span>
            <span className="text-foreground font-medium">{chats.used}/{chats.total}회 남음</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(chats.used / chats.total) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
