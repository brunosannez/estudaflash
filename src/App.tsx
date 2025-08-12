
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DataSeederService } from "@/services/dataSeederService";
import { LazyUpload, LazyMyFlashcards, LazyQuizHistory, LazyMySummaries, LazyMyProgress, LazySocial, LazyAdminPanel } from "@/utils/lazyLoading";
import Index from "./pages/Index";
import Resumo from "./pages/Resumo";
import Quiz from "./pages/Quiz";
import QuizHistoryView from "./pages/QuizHistoryView";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewSignup from "./pages/NewSignup";
import Home from "./pages/Home";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import MindMap from "./pages/MindMap";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();

  console.log('🚀 App rendering - User:', !!user, 'Loading:', loading);

  useEffect(() => {
    // Initialize data seeding and user setup
    DataSeederService.seedInitialData();
    
    if (user?.id) {
      DataSeederService.seedUserInitialData(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              path="/my-summaries" 
              element={
                <ProtectedRoute>
                  <LazyMySummaries />
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
              path="/my-flashcards" 
              element={
                <ProtectedRoute>
                  <LazyMyFlashcards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:id" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz-history" 
              element={
                <ProtectedRoute>
                  <LazyQuizHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz-history/:sessionId/view" 
              element={
                <ProtectedRoute>
                  <QuizHistoryView />
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
              path="/mind-map/:id" 
              element={
                <ProtectedRoute>
                  <MindMap />
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
