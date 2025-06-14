
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Resumo from "./pages/Resumo";
import NotFound from "./pages/NotFound";
import QuizPage from "@/pages/Quiz";
import MyProgress from "@/pages/MyProgress";
import MySummaries from "@/pages/MySummaries";
import MyFlashcards from "@/pages/MyFlashcards";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/home" element={<Home />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/resumo/:uploadId" element={
        <ProtectedRoute>
          <Resumo />
        </ProtectedRoute>
      } />
      <Route path="/quiz/:resumoId" element={
        <ProtectedRoute>
          <QuizPage />
        </ProtectedRoute>
      } />
      <Route path="/progresso" element={
        <ProtectedRoute>
          <MyProgress />
        </ProtectedRoute>
      } />
      <Route path="/meus-resumos" element={
        <ProtectedRoute>
          <MySummaries />
        </ProtectedRoute>
      } />
      <Route path="/meus-flashcards" element={
        <ProtectedRoute>
          <MyFlashcards />
        </ProtectedRoute>
      } />
      
      {/* Redirect logic */}
      <Route path="*" element={
        user ? <Navigate to="/" replace /> : <Navigate to="/home" replace />
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
