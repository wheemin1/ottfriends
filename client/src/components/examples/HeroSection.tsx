import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <div className="bg-background">
      <HeroSection onCTAClick={() => console.log('CTA clicked')} />
    </div>
  );
}
