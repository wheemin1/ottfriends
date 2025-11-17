import { useState } from 'react';
import MyPage from '../MyPage';

export default function MyPageExample() {
  const [platforms, setPlatforms] = useState<string[]>(['netflix']);

  const watchedMovies = [
    { id: '1', title: '인터스텔라', posterUrl: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg' },
    { id: '2', title: '기생충', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  ];

  const wishlistMovies = [
    { id: '3', title: '어벤져스', posterUrl: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg' },
    { id: '4', title: '노트북', posterUrl: 'https://image.tmdb.org/t/p/w500/qom1SZSENdmHFNZBXbtJAU0WTlC.jpg' },
  ];

  return (
    <MyPage
      recommendations={{ used: 2, total: 3 }}
      chats={{ used: 45, total: 50 }}
      selectedPlatforms={platforms}
      watchedMovies={watchedMovies}
      wishlistMovies={wishlistMovies}
      onUpgrade={() => console.log('Upgrade clicked')}
      onPlatformsChange={(p) => {
        setPlatforms(p);
        console.log('Platforms changed:', p);
      }}
      onMovieClick={(id) => console.log('Movie clicked:', id)}
    />
  );
}
