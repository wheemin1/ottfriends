import { useState } from 'react';
import PersonaSelector from '../PersonaSelector';

export default function PersonaSelectorExample() {
  const [persona, setPersona] = useState("friendly");

  return (
    <div className="p-4 bg-background min-h-screen">
      <PersonaSelector value={persona} onChange={(val) => {
        setPersona(val);
        console.log('Persona changed to:', val);
      }} />
    </div>
  );
}
