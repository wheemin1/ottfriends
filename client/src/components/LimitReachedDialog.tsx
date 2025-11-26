import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Database } from "lucide-react";

interface LimitReachedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPremium: boolean;
  onUpgrade?: () => void;
}

export default function LimitReachedDialog({ open, onOpenChange, isPremium, onUpgrade }: LimitReachedDialogProps) {
  if (isPremium) {
    // 프리미엄 유저 - 10개 제한 도달
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
              <DialogTitle className="text-xl font-bold text-white">저장 공간 가득 참 💾</DialogTitle>
            </div>
            <DialogDescription className="text-slate-300 text-base leading-relaxed mt-4">
              쾌적한 서비스 제공을 위해 최대 10개까지만 저장할 수 있어요.<br />
              새로운 대화를 시작하려면 기존 채팅방을 삭제해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
              variant="outline"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 무료 유저 - 3개 제한 도달
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock className="h-6 w-6 text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">무료 플랜 한도 초과 🔒</DialogTitle>
          </div>
          <DialogDescription className="text-slate-300 text-base leading-relaxed mt-4">
            무료 버전은 채팅방을 3개까지만 만들 수 있어요.<br />
            프리미엄으로 업그레이드하고 10개까지 저장하세요!
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
            variant="outline"
          >
            취소
          </Button>
          <Button
            onClick={() => {
              onUpgrade?.();
              onOpenChange(false);
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg"
          >
            프리미엄 업그레이드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
