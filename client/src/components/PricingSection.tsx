import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

interface PricingSectionProps {
  onFreeCTA: () => void;
  onPremiumCTA: () => void;
}

export default function PricingSection({ onFreeCTA, onPremiumCTA }: PricingSectionProps) {
  const plans = [
    {
      name: "Free",
      price: "무료",
      features: [
        "매일 3회 '추천 세트' 무료",
        "AI 잡담 및 공감 (매일 50회)",
      ],
      cta: "채팅 시작하기",
      onClick: onFreeCTA,
      variant: "outline" as const
    },
    {
      name: "Premium",
      price: "첫 달 ₩990",
      priceDetail: "(이후 매월 ₩1,900 또는 연간 ₩9,900)",
      features: [
        "무제한 추천 및 대화",
        "광고 제거",
        "'친구 페르소나' 선택",
      ],
      cta: "프리미엄 시작하기",
      onClick: onPremiumCTA,
      variant: "default" as const,
      icon: <Crown className="h-5 w-5" />
    }
  ];

  return (
    <section className="py-20 px-4" data-testid="pricing-section">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {plan.name}
                  {plan.icon}
                </CardTitle>
                <CardDescription className="text-xl font-bold text-foreground mt-2">
                  {plan.price}
                  {plan.priceDetail && (
                    <span className="block text-sm text-muted-foreground font-normal mt-1">
                      {plan.priceDetail}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.onClick}
                  variant={plan.variant}
                  className="w-full rounded-xl"
                  data-testid={`button-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
