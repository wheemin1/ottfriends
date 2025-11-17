import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import ChatApp from "@/pages/ChatApp";

function Router() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <ChatApp />;
  }

  return (
    <Switch>
      <Route path="/">
        <LandingPage onStartChat={() => setShowChat(true)} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
