
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import MySummaries from "./pages/MySummaries";
import Resumo from "./pages/Resumo";
import MyFlashcards from "./pages/MyFlashcards";
import Quiz from "./pages/Quiz";
import EnhancedQuizHistory from "./pages/EnhancedQuizHistory";
import QuizHistoryView from "./pages/QuizHistoryView";
import MyProgress from "./pages/MyProgress";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewSignup from "./pages/NewSignup";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import MindMap from "./pages/MindMap";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthGuard>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/new-signup" element={<NewSignup />} />
              
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <Upload />
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
                path="/my-flashcards" 
                element={
                  <ProtectedRoute>
                    <MyFlashcards />
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
                    <EnhancedQuizHistory />
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
                    <MyProgress />
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
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGuard>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
