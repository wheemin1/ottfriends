import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MoviePoster from "./MoviePoster";
import OTTPlatforms from "./OTTPlatforms";

interface DetailsPanelProps {
  movie?: {
    title: string;
    posterUrl: string;
    oneLiner: string;
    platforms: string[];
    plot: string;
    reviews: string[];
    cast: { name: string; character: string; photo: string }[];
  };
}

export default function DetailsPanel({ movie }: DetailsPanelProps) {
  if (!movie) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-8" data-testid="details-panel-empty">
        <p className="text-muted-foreground text-center">
          추천 작품을 선택하면<br />
          상세 정보가 여기 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen bg-background" data-testid="details-panel">
      <div className="p-6 space-y-6">
        <MoviePoster
          imageUrl={movie.posterUrl}
          title={movie.title}
          className="w-full aspect-[2/3]"
        />
        
        <div className="space-y-3">
          <p className="text-lg text-foreground italic">"{movie.oneLiner}"</p>
          <OTTPlatforms platforms={movie.platforms} />
        </div>

        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="plot" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 bg-card hover:no-underline hover-elevate" data-testid="accordion-plot">
              <span>그래서, 뭔 내용인데? 📖</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4">
              <p className="text-muted-foreground leading-relaxed">{movie.plot}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reviews" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 bg-card hover:no-underline hover-elevate" data-testid="accordion-reviews">
              <span>다른 애들 생각은? 🌎</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-3">
              {movie.reviews.map((review, idx) => (
                <div key={idx} className="p-3 bg-card rounded-xl">
                  <p className="text-sm text-muted-foreground">{review}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cast" className="border-0">
            <AccordionTrigger className="rounded-xl px-4 bg-card hover:no-underline hover-elevate" data-testid="accordion-cast">
              <span>누가 나오는데?</span>
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
            <AccordionTrigger className="rounded-xl px-4 bg-card hover:no-underline hover-elevate" data-testid="accordion-comments">
              <span>우리 친구들 후기는? ✍️</span>
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
