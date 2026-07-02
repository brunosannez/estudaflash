
import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DataSeederService } from "@/services/dataSeederService";
import { LazyUpload, LazyMyFlashcards, LazyMyProgress, LazySocial, LazyAdminPanel } from "@/utils/lazyLoading";
import { PageLoading } from '@/components/common/LoadingStates';
import Index from "./pages/Index";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Páginas secundárias em lazy loading para reduzir o bundle inicial
const Login = React.lazy(() => import("./pages/Login"));
const NewSignup = React.lazy(() => import("./pages/NewSignup"));
const AdminAnalytics = React.lazy(() => import("./pages/AdminAnalytics"));
const MindMap = React.lazy(() => import("./pages/MindMap"));
const MySummaries = React.lazy(() => import("./pages/MySummaries"));
const Resumo = React.lazy(() => import("./pages/Resumo"));
const EnemQuiz = React.lazy(() => import("./pages/EnemQuiz"));
const QuizHistory = React.lazy(() => import("./pages/QuizHistory"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const ChoosePlan = React.lazy(() => import("./pages/ChoosePlan"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

// Componente interno que usa hooks de router - DENTRO do BrowserRouter
const AppRoutes = () => {
  const { user, loading } = useAuth();

  console.log('🚀 AppRoutes rendering - User:', !!user, 'Loading:', loading);

  useEffect(() => {
    if (user?.id) {
      // Only seed data when user is authenticated to avoid RLS errors
      DataSeederService.seedInitialData();
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
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <NewSignup />} />
        <Route path="/new-signup" element={user ? <Navigate to="/" replace /> : <NewSignup />} />
        {/* Recuperação de senha - /reset-password precisa renderizar mesmo com sessão,
            pois o link de recuperação autentica o usuário antes de trocar a senha */}
        <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rota de sucesso de pagamento - pode ser acessada sem login para verificação */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        {/* Rota de escolha de plano */}
        <Route 
          path="/choose-plan" 
          element={
            <ProtectedRoute>
              <ChoosePlan />
            </ProtectedRoute>
          } 
        />
        
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
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
