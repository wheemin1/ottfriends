export default function TypingIndicator() {
  return (
    <div className="flex justify-start" data-testid="typing-indicator">
      <div className="bg-card px-4 py-3 rounded-xl">
        <div className="dot-pulse">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
