import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  onPremiumClick: () => void;
  onMyPageClick?: () => void;
  onPersonaClick?: () => void;
  onLoginClick?: () => void;
  quotaInfo?: {
    recommendations: { used: number; total: number };
    chats: { used: number; total: number };
  };
}

export default function ChatHeader({
  onPremiumClick,
  onMyPageClick,
  onPersonaClick,
  onLoginClick,
  quotaInfo
}: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 프리미엄 버튼 (Gemini PRO 위치) */}
      <Button
        variant="default"
        size="sm"
        onClick={onPremiumClick}
        className="rounded-full"
        data-testid="button-premium-header"
      >
        <Crown className="h-4 w-4 mr-1" />
        프리미엄
      </Button>

      {/* v3.18 프로필 드롭다운 (Gemini 스타일) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            data-testid="button-profile"
          >
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 rounded-xl">
          {/* v3.10: 쿼터 정보 (헤더에서 메뉴 안으로 이동) */}
          {quotaInfo && (
            <>
              <div className="px-3 py-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">추천</span>
                  <span className="font-medium">
                    {quotaInfo.recommendations.total - quotaInfo.recommendations.used}/{quotaInfo.recommendations.total}회 남음
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">잡담</span>
                  <span className="font-medium">
                    {quotaInfo.chats.total - quotaInfo.chats.used}/{quotaInfo.chats.total}회 남음
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {/* 1순위: 마이페이지 */}
          {onMyPageClick && (
            <DropdownMenuItem onClick={onMyPageClick} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>마이페이지</span>
            </DropdownMenuItem>
          )}

          {/* 2순위: 페르소나 설정 */}
          {onPersonaClick && (
            <DropdownMenuItem onClick={onPersonaClick} className="cursor-pointer">
              <span className="mr-2">🤖</span>
              <span>친구 페르소나 설정</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* 3순위: 로그인/백업 */}
          {onLoginClick && (
            <DropdownMenuItem onClick={onLoginClick} className="cursor-pointer">
              <span className="mr-2">☁️</span>
              <span>로그인/백업하기</span>
            </DropdownMenuItem>
          )}

          {/* 4순위: 공지사항/문의 */}
          <DropdownMenuItem className="cursor-pointer">
            <span className="mr-2">💡</span>
            <span>공지사항 / 문의하기</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
