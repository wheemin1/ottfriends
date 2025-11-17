import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '../AppSidebar';

export default function AppSidebarExample() {
  const [persona, setPersona] = useState("friendly");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          persona={persona}
          onPersonaChange={(p) => {
            setPersona(p);
            console.log('Persona changed:', p);
          }}
          onLoginClick={() => console.log('Login clicked')}
          onNewChat={() => console.log('New chat clicked')}
        />
      </div>
    </SidebarProvider>
  );
}
