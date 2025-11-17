import MoviePoster from "./MoviePoster";

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
}

interface MovieGridProps {
  movies: Movie[];
  onMovieClick?: (movieId: string) => void;
}

export default function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" data-testid="movie-grid">
      {movies.map((movie) => (
        <button
          key={movie.id}
          onClick={() => onMovieClick?.(movie.id)}
          className="hover-elevate active-elevate-2 rounded-xl transition-all"
          data-testid={`movie-${movie.id}`}
        >
          <MoviePoster
            imageUrl={movie.posterUrl}
            title={movie.title}
            className="aspect-[2/3]"
          />
        </button>
      ))}
    </div>
  );
}
