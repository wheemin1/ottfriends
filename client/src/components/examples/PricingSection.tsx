import PricingSection from '../PricingSection';

export default function PricingSectionExample() {
  return (
    <div className="bg-background">
      <PricingSection
        onFreeCTA={() => console.log('Free plan clicked')}
        onPremiumCTA={() => console.log('Premium plan clicked')}
      />
    </div>
  );
}
