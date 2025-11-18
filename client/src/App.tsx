import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserConfigProvider } from "@/contexts/UserConfigContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import ChatApp from "@/pages/ChatApp";

function Router() {
  // v4.1.2: localStorage에서 채팅 시작 여부 복원
  const [showChat, setShowChat] = useState(() => {
    const saved = localStorage.getItem('ottfriend_chat_started');
    return saved === 'true';
  });

  // v4.1.2: 채팅 시작 시 localStorage에 저장
  const handleStartChat = () => {
    localStorage.setItem('ottfriend_chat_started', 'true');
    setShowChat(true);
  };

  if (showChat) {
    return <ChatApp />;
  }

  return (
    <Switch>
      <Route path="/">
        <LandingPage onStartChat={handleStartChat} />
      </Route>
      <Route path="/chat">
        <ChatApp />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserConfigProvider>
        <TooltipProvider>
          <div className="h-full overflow-hidden">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </UserConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
