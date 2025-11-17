import ChatBubble from '../ChatBubble';

export default function ChatBubbleExample() {
  return (
    <div className="space-y-4 p-4 bg-background min-h-screen">
      <ChatBubble message="안녕! 오늘 기분이 어때?" isAI={true} />
      <ChatBubble message="피곤해... 😔" isAI={false} />
      <ChatBubble message="아... 나도 그랬어 😔 그럼 가볍게 볼 수 있는 작품 추천해 줄게!" isAI={true} />
    </div>
  );
}
