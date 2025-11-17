import OTTPlatforms from '../OTTPlatforms';

export default function OTTPlatformsExample() {
  return (
    <div className="p-4 bg-background min-h-screen">
      <OTTPlatforms platforms={['netflix', 'disney']} />
    </div>
  );
}
