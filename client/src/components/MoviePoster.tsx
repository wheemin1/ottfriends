import { cn } from "@/lib/utils";

interface MoviePosterProps {
  imageUrl: string;
  title: string;
  className?: string;
}

export default function MoviePoster({ imageUrl, title, className }: MoviePosterProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)} data-testid="movie-poster">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
