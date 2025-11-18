import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroMockup from '@assets/generated_images/Mobile_chat_interface_mockup_e5e260b1.png';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  const scrollToFeatures = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-20 px-4 relative" data-testid="hero-section">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center flex-1">
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
      
      {/* v3.22: 스크롤 유도 */}
      <button
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground hover:text-foreground transition-colors"
        aria-label="스크롤 다운"
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </section>
  );
}
