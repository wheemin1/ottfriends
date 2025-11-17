import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  const handleSend = (message: string) => {
    console.log('Message sent:', message);
  };

  return (
    <div className="bg-background min-h-screen flex items-end">
      <div className="w-full">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
