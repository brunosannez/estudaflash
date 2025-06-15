
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Index from '@/pages/Index';
import Upload from '@/pages/Upload';
import MySummaries from '@/pages/MySummaries';
import Resumo from '@/pages/Resumo';
import MyFlashcards from '@/pages/MyFlashcards';
import Quiz from '@/pages/Quiz';
import QuizHistory from '@/pages/QuizHistory';
import MyProgress from '@/pages/MyProgress';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NewSignup from '@/pages/NewSignup';
import AdminPanel from '@/pages/AdminPanel';
import AdminAnalytics from '@/pages/AdminAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/new-signup" element={<NewSignup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/my-summaries" element={
              <ProtectedRoute>
                <MySummaries />
              </ProtectedRoute>
            } />
            <Route path="/resumo/:id" element={
              <ProtectedRoute>
                <Resumo />
              </ProtectedRoute>
            } />
            <Route path="/my-flashcards" element={
              <ProtectedRoute>
                <MyFlashcards />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:resumoId" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />
            <Route path="/quiz-history" element={
              <ProtectedRoute>
                <QuizHistory />
              </ProtectedRoute>
            } />
            <Route path="/my-progress" element={
              <ProtectedRoute>
                <MyProgress />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
