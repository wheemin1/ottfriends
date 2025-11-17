import MoviePoster from '../MoviePoster';

export default function MoviePosterExample() {
  return (
    <div className="p-4 bg-background min-h-screen">
      <MoviePoster
        imageUrl="https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg"
        title="인터스텔라"
        className="w-64 h-96"
      />
    </div>
  );
}
