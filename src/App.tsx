
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import MySummaries from "./pages/MySummaries";
import Resumo from "./pages/Resumo";
import MyFlashcards from "./pages/MyFlashcards";
import Quiz from "./pages/Quiz";
import QuizHistory from "./pages/QuizHistory";
import MyProgress from "./pages/MyProgress";
import AdminPanel from "./pages/AdminPanel";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/meus-resumos" element={<MySummaries />} />
            <Route path="/resumo/:id" element={<Resumo />} />
            <Route path="/meus-flashcards" element={<MyFlashcards />} />
            <Route path="/quiz/:resumoId" element={<Quiz />} />
            <Route path="/historico-quiz" element={<QuizHistory />} />
            <Route path="/progresso" element={<MyProgress />} />
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Redirecionamentos para manter compatibilidade */}
            <Route path="/summaries" element={<MySummaries />} />
            <Route path="/flashcards" element={<MyFlashcards />} />
            <Route path="/quiz-history" element={<QuizHistory />} />
            <Route path="/progress" element={<MyProgress />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
