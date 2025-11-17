import { useState } from 'react';
import OTTFilter from '../OTTFilter';

export default function OTTFilterExample() {
  const [selected, setSelected] = useState<string[]>(['netflix']);

  return (
    <div className="p-4 bg-background min-h-screen">
      <OTTFilter
        selected={selected}
        onChange={(platforms) => {
          setSelected(platforms);
          console.log('Selected platforms:', platforms);
        }}
      />
    </div>
  );
}
