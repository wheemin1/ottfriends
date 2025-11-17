import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroMockup from '@assets/generated_images/Mobile_chat_interface_mockup_e5e260b1.png';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center py-20 px-4" data-testid="hero-section">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            야, 오늘 뭐 볼까?
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            AI 친구와 '진짜 대화'로 넷플, 디플 인생작 추천받기.<br />
            다운로드 없는 웹앱.
          </h2>
          <Button
            onClick={onCTAClick}
            size="lg"
            className="rounded-xl text-lg px-8 py-6 h-auto"
            data-testid="button-cta-hero"
          >
            지금 바로 채팅 시작하기 (무료, 로그인 X)
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <img
            src={heroMockup}
            alt="Chat interface mockup"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
