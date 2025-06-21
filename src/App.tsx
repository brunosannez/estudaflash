
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from '@/components/AuthGuard';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NewSignup from '@/pages/NewSignup';
import Upload from '@/pages/Upload';
import MySummaries from '@/pages/MySummaries';
import Resumo from '@/pages/Resumo';
import MyFlashcards from '@/pages/MyFlashcards';
import Quiz from '@/pages/Quiz';
import QuizHistory from '@/pages/QuizHistory';
import MyProgress from '@/pages/MyProgress';
import AdminPanel from '@/pages/AdminPanel';
import AdminAnalytics from '@/pages/AdminAnalytics';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import MindMap from '@/pages/MindMap';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/new-signup" element={<NewSignup />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            <Route path="/upload" element={
              <AuthGuard>
                <Upload />
              </AuthGuard>
            } />
            <Route path="/my-summaries" element={
              <AuthGuard>
                <MySummaries />
              </AuthGuard>
            } />
            <Route path="/resumo/:id" element={
              <AuthGuard>
                <Resumo />
              </AuthGuard>
            } />
            <Route path="/mind-map/:id" element={
              <AuthGuard>
                <MindMap />
              </AuthGuard>
            } />
            <Route path="/my-flashcards" element={
              <AuthGuard>
                <MyFlashcards />
              </AuthGuard>
            } />
            <Route path="/quiz/:id" element={
              <AuthGuard>
                <Quiz />
              </AuthGuard>
            } />
            <Route path="/quiz-history" element={
              <AuthGuard>
                <QuizHistory />
              </AuthGuard>
            } />
            <Route path="/progress" element={
              <AuthGuard>
                <MyProgress />
              </AuthGuard>
            } />
            <Route path="/admin" element={
              <AuthGuard>
                <AdminPanel />
              </AuthGuard>
            } />
            <Route path="/admin/analytics" element={
              <AuthGuard>
                <AdminAnalytics />
              </AuthGuard>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
