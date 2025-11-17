import PillButton from '../PillButton';

export default function PillButtonExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-background min-h-screen">
      <PillButton label="코미디 영화" onClick={() => console.log('코미디 영화 clicked')} />
      <PillButton label="넷플릭스 시리즈" onClick={() => console.log('넷플릭스 시리즈 clicked')} />
      <PillButton label="힐링 드라마" onClick={() => console.log('힐링 드라마 clicked')} />
    </div>
  );
}
