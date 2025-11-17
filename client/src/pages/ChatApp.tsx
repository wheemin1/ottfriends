import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AppSidebar from "@/components/AppSidebar";
import ChatInterface from "@/components/ChatInterface";
import DetailsPanel from "@/components/DetailsPanel";
import MyPage from "@/components/MyPage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PricingSection from "@/components/PricingSection";

export default function ChatApp() {
  const [persona, setPersona] = useState("friendly");
  const [showPricing, setShowPricing] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [platforms, setPlatforms] = useState<string[]>(['netflix']);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mockMovie = {
    title: '인터스텔라',
    year: '2014',
    runtime: '169분',
    genre: 'SF · 드라마',
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    oneLiner: '우주 여행의 감동, 가족애의 울림',
    platforms: ['netflix'],
    plot: '지구의 멸망을 막기 위해 우주로 떠난 탐험가들의 이야기. 시간과 공간을 초월한 사랑과 희생이 교차하는 SF 대작.',
    reviews: [
      '"시각 효과가 놀랍고 감정적 깊이가 인상적이다" - 로튼 토마토',
      '"크리스토퍼 놀란의 최고 걸작 중 하나" - IMDb',
      '"과학과 감성의 완벽한 조화" - Metacritic'
    ],
    cast: [
      { name: '매튜 맥커너히', character: '쿠퍼', photo: 'https://image.tmdb.org/t/p/w185/sY2mwpafcwqyYS1sOySu1MENDse.jpg' },
      { name: '앤 해서웨이', character: '브랜드', photo: 'https://image.tmdb.org/t/p/w185/9qGu2XLC6v92eo7fq5Gw2mQMFYF.jpg' },
      { name: '제시카 차스테인', character: '머피', photo: 'https://image.tmdb.org/t/p/w185/fPBe5cPdZzQPrX0Qgl1LkR2NMKI.jpg' },
    ]
  };

  const watchedMovies = [
    { id: '1', title: '인터스텔라', posterUrl: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg' },
    { id: '2', title: '기생충', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  ];

  const wishlistMovies = [
    { id: '3', title: '어벤져스', posterUrl: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg' },
    { id: '4', title: '노트북', posterUrl: 'https://image.tmdb.org/t/p/w500/qom1SZSENdmHFNZBXbtJAU0WTlC.jpg' },
  ];

  const handleRecommendationClick = (rec: string) => {
    console.log('Recommendation clicked:', rec);
    setSelectedMovie(mockMovie);
  };

  return (
    <>
      <div className="flex h-screen w-full relative">
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
              data-testid="sidebar-overlay"
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 animate-in slide-in-from-left">
              <SidebarProvider>
                <AppSidebar
                  persona={persona}
                  onPersonaChange={setPersona}
                  onLoginClick={() => {
                    setShowMyPage(true);
                    setSidebarOpen(false);
                  }}
                  onNewChat={() => {
                    console.log('New chat');
                    setSidebarOpen(false);
                  }}
                />
              </SidebarProvider>
            </div>
          </>
        )}

        <div className="flex-1 flex">
          <div className="w-full md:w-2/5 border-r border-border">
            <ChatInterface
              onMenuClick={() => setSidebarOpen(true)}
              onPremiumClick={() => setShowPricing(true)}
              onRecommendationClick={handleRecommendationClick}
              persona={persona as "friendly" | "tsundere"}
            />
          </div>

          <div className="hidden md:block md:w-3/5">
            <DetailsPanel movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
          </div>

          <Sheet open={!!selectedMovie && window.innerWidth < 768} onOpenChange={(open) => !open && setSelectedMovie(null)}>
            <SheetContent side="bottom" className="h-[90vh] p-0">
              <DetailsPanel movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
            </SheetContent>
          </Sheet>
        </div>

        <Dialog open={showPricing} onOpenChange={setShowPricing}>
          <DialogContent className="max-w-4xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">요금제 선택</DialogTitle>
            </DialogHeader>
            <PricingSection
              onFreeCTA={() => setShowPricing(false)}
              onPremiumCTA={() => {
                console.log('Premium selected');
                setShowPricing(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showMyPage} onOpenChange={setShowMyPage}>
          <DialogContent className="max-w-2xl max-h-[90vh] rounded-xl p-0">
            <MyPage
              recommendations={{ used: 2, total: 3 }}
              chats={{ used: 45, total: 50 }}
              selectedPlatforms={platforms}
              watchedMovies={watchedMovies}
              wishlistMovies={wishlistMovies}
              onUpgrade={() => setShowPricing(true)}
              onPlatformsChange={setPlatforms}
              onMovieClick={(id) => console.log('Movie clicked:', id)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
