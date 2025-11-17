import { Card, CardContent } from "@/components/ui/card";
import { Film, Brain, Globe } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Film,
      title: "AI가 '지금' 볼 수 있는 것만!",
      description: "TMDB 실시간 연동으로 넷플릭스, 디즈니+ 등 구독 중인 OTT에 '실제로' 있는 작품만 추천해 줘요."
    },
    {
      icon: Brain,
      title: "어제 본 것도 '기억'하는 진짜 친구 🧠",
      description: "AI가 어제 나눈 대화와 내가 '이미 봄' 처리한 작품을 기억하고, 절대 중복 추천하지 않아요."
    },
    {
      icon: Globe,
      title: "AI가 번역한 '글로벌 후기'로 검증까지 🌎",
      description: "친구가 추천해준 작품, AI가 번역한 '찰진' 글로벌 후기(Top 3)로 한 번 더 검증해 보세요."
    }
  ];

  return (
    <section className="py-20 px-4" data-testid="features-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="rounded-xl hover-elevate transition-all">
              <CardContent className="p-6 space-y-4">
                <feature.icon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
