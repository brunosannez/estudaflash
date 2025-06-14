
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, User, LogOut, Brain, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Início', icon: BookOpen },
    { path: '/meus-resumos', label: 'Meus Resumos', icon: FileText },
    { path: '/meus-flashcards', label: 'Flashcards', icon: Brain },
    { path: '/progresso', label: 'Progresso', icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">EstudoFácil AI</h1>
          </div>
          
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 ${
                      isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                    }`}
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <Button variant="outline" onClick={signOut} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <AuthModal>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
