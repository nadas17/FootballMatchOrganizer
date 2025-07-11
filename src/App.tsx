import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FluidGlassNav from "./components/FluidGlassNav";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const Matches = lazy(() => import("./pages/Matches"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="loading-spinner"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Adding a simple error boundary
  try {
    console.log("App component rendering");
    return (
      <div className="relative">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <FluidGlassNav />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </div>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
        <h1>Application Error</h1>
        <p>There was an error rendering the application. Please check the console for details.</p>
      </div>
    );
  }
};

export default App;
