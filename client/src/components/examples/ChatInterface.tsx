import ChatInterface from '../ChatInterface';

export default function ChatInterfaceExample() {
  return (
    <ChatInterface
      onMenuClick={() => console.log('Menu clicked')}
      onPremiumClick={() => console.log('Premium clicked')}
      onRecommendationClick={(rec) => console.log('Recommendation clicked:', rec)}
    />
  );
}
