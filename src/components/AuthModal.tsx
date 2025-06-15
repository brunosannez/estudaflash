
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  children: React.ReactNode;
}

const AuthModal = ({ children }: AuthModalProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      setOpen(false);
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await signUp(email, password);
      setOpen(false);
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      console.error('Sign up error:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar ou Criar Conta</DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Para uma melhor experiência, use nossas páginas dedicadas:
          </p>
          <div className="space-y-2">
            <Link to="/signup" className="block">
              <Button className="w-full" onClick={() => setOpen(false)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </Link>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                <LogIn className="h-4 w-4 mr-2" />
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Senha</Label>
              <Input
                id="signin-password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSignIn} 
              className="w-full"
              disabled={loading || !email || !password}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Senha</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Sua senha (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSignUp} 
              className="w-full"
              disabled={loading || !email || password.length < 6}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
