import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Heart, Popcorn, BookOpen, Globe, Users, MessageSquare, Star } from "lucide-react";
import MoviePoster from "./MoviePoster";
import OTTPlatforms from "./OTTPlatforms";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import friendlyAvatar from '@assets/generated_images/Friendly_AI_persona_avatar_ae12e60b.png';

interface DetailsPanelProps {
  movie?: {
    title: string;
    year: string;
    runtime: string;
    genre: string;
    rating: number;
    posterUrl: string;
    oneLiner: string;
    platforms: string[];
    plot: string;
    reviews: string[];
    cast: { name: string; character: string; photo: string }[];
  };
  onClose?: () => void;
}

export default function DetailsPanel({ movie, onClose }: DetailsPanelProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  if (!movie) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-8" data-testid="details-panel-empty">
        <Avatar className="h-32 w-32 mb-6">
          <AvatarImage src={friendlyAvatar} alt="AI Friend" />
          <AvatarFallback>☺️</AvatarFallback>
        </Avatar>
        <p className="text-foreground text-xl font-medium mb-2">
          오늘은 어떤 영화를 찾아줄까? 🍿
        </p>
        <p className="text-muted-foreground text-center">
          추천 작품을 선택하면<br />
          상세 정보가 여기 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen bg-background" data-testid="details-panel">
      <div className="p-6 space-y-6 relative">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full"
            data-testid="button-close-details"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        <div className="w-full max-h-[400px] bg-background rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-contain"
            style={{ maxHeight: '400px' }}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-movie-title">
            {movie.title}
          </h1>
          
          <p className="text-muted-foreground" data-testid="text-movie-meta">
            {movie.year} · {movie.runtime} · {movie.genre}
          </p>

          <div className="flex gap-2">
            <Button
              variant={isWishlisted ? "default" : "outline"}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="rounded-full flex-1"
              data-testid="button-wishlist"
            >
              <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
              찜하기
            </Button>
            <Button
              variant={isWatched ? "default" : "outline"}
              onClick={() => setIsWatched(!isWatched)}
              className="rounded-full flex-1"
              data-testid="button-watched"
            >
              <Popcorn className="h-4 w-4 mr-2" />
              이미 봄
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary fill-current" />
            <span className="text-lg font-bold text-foreground">{movie.rating}</span>
            <span className="text-muted-foreground">/10</span>
          </div>

          <OTTPlatforms platforms={movie.platforms} />
          
          <p className="text-lg text-foreground italic border-l-4 border-primary pl-4">
            "{movie.oneLiner}"
          </p>
        </div>

        <Accordion type="multiple" className="space-y-3">
          <AccordionItem value="plot" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-plot">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">그래서, 뭔 내용인데?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4">
              <p className="text-muted-foreground leading-relaxed">{movie.plot}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-reviews">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium">다른 애들 생각은?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-3">
              {movie.reviews.map((review, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">{review}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cast" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-cast">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">누가 나오는데?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                {movie.cast.map((actor, idx) => (
                  <div key={idx} className="text-center">
                    <img src={actor.photo} alt={actor.name} className="w-full aspect-square object-cover rounded-xl mb-2" />
                    <p className="text-sm font-medium text-foreground">{actor.name}</p>
                    <p className="text-xs text-muted-foreground">{actor.character}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="comments" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 py-4 bg-card hover:no-underline hover-elevate flex items-center justify-between" data-testid="accordion-comments">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">우리 친구들 후기는?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-3">
              <div className="space-y-3">
                <Textarea
                  placeholder="후기를 남겨주세요..."
                  className="rounded-xl min-h-[100px]"
                  data-testid="textarea-comment"
                />
                <Button className="w-full rounded-xl" data-testid="button-submit-comment">
                  후기 남기기
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
