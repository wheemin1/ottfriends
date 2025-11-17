import MovieGrid from '../MovieGrid';

export default function MovieGridExample() {
  const movies = [
    { id: '1', title: '인터스텔라', posterUrl: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg' },
    { id: '2', title: '기생충', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
    { id: '3', title: '어벤져스', posterUrl: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg' },
    { id: '4', title: '노트북', posterUrl: 'https://image.tmdb.org/t/p/w500/qom1SZSENdmHFNZBXbtJAU0WTlC.jpg' },
    { id: '5', title: '타이타닉', posterUrl: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },
  ];

  return (
    <div className="p-4 bg-background min-h-screen">
      <MovieGrid movies={movies} onMovieClick={(id) => console.log('Movie clicked:', id)} />
    </div>
  );
}
