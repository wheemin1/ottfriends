import UsageStats from '../UsageStats';

export default function UsageStatsExample() {
  return (
    <div className="p-4 bg-background min-h-screen">
      <UsageStats
        recommendations={{ used: 2, total: 3 }}
        chats={{ used: 45, total: 50 }}
        onUpgrade={() => console.log('Upgrade clicked')}
      />
    </div>
  );
}
