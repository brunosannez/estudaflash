
import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DataSeederService } from "@/services/dataSeederService";
import { LazyUpload, LazyMyFlashcards, LazyMyProgress, LazySocial, LazyAdminPanel } from "@/utils/lazyLoading";
import { PageLoading } from '@/components/common/LoadingStates';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewSignup from "./pages/NewSignup";
import Home from "./pages/Home";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import MindMap from "./pages/MindMap";
import MySummaries from "./pages/MySummaries";
import Resumo from "./pages/Resumo";
import EnemQuiz from "./pages/EnemQuiz";
import QuizHistory from "./pages/QuizHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

// Componente interno que usa hooks de router - DENTRO do BrowserRouter
const AppRoutes = () => {
  const { user, loading } = useAuth();

  console.log('🚀 AppRoutes rendering - User:', !!user, 'Loading:', loading);

  useEffect(() => {
    // Initialize data seeding and user setup
    DataSeederService.seedInitialData();
    
    if (user?.id) {
      DataSeederService.seedUserInitialData(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoading title="Carregando a página..." />}>
      <Routes>
        {/* Rota principal - Dashboard para autenticados, Home para não autenticados */}
        <Route path="/" element={user ? <Index /> : <Home />} />
        
        {/* Redirecionamentos para garantir que sempre use a interface atual */}
        <Route path="/home" element={user ? <Navigate to="/" replace /> : <Home />} />
        <Route path="/dashboard" element={user ? <Index /> : <Navigate to="/login" replace />} />
        
        {/* Rotas de autenticação */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/new-signup" element={user ? <Navigate to="/" replace /> : <NewSignup />} />
        
        {/* Rota de sucesso de pagamento - pode ser acessada sem login para verificação */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        {/* Rotas protegidas */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <LazyUpload />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-flashcards" 
          element={
            <ProtectedRoute>
              <LazyMyFlashcards />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-progress" 
          element={
            <ProtectedRoute>
              <LazyMyProgress />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/social" 
          element={
            <ProtectedRoute>
              <LazySocial />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-summaries" 
          element={
            <ProtectedRoute>
              <MySummaries />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resumo/:id" 
          element={
            <ProtectedRoute>
              <Resumo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz-enem/:id" 
          element={
            <ProtectedRoute>
              <EnemQuiz />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mind-map/:id" 
          element={
            <ProtectedRoute>
              <MindMap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz-history" 
          element={
            <ProtectedRoute>
              <QuizHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <LazyAdminPanel />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />
        
        {/* Rota 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
