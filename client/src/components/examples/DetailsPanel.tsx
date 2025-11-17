import DetailsPanel from '../DetailsPanel';

export default function DetailsPanelExample() {
  const mockMovie = {
    title: '인터스텔라',
    year: '2014',
    runtime: '169분',
    genre: 'SF · 드라마',
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    oneLiner: '우주 여행의 감동, 가족애의 울림',
    platforms: ['netflix', 'disney'],
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

  return <DetailsPanel movie={mockMovie} onClose={() => console.log('Close clicked')} />;
}
