import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";

interface LandingPageProps {
  onStartChat: () => void;
}

export default function LandingPage({ onStartChat }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection onCTAClick={onStartChat} />
      <FeaturesSection />
      <PricingSection onFreeCTA={onStartChat} onPremiumCTA={onStartChat} />
    </div>
  );
}
