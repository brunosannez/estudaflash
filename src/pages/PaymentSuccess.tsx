import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          // Em respostas não-2xx o corpo (com a mensagem real, ex. "Payment
          // not completed") fica em error.context e não em error.message
          const errorContext = (error as any)?.context;
          if (errorContext && typeof errorContext.json === 'function') {
            try {
              const body = await errorContext.json();
              if (body?.message === 'Payment not completed') {
                setVerificationStatus('error');
                toast({
                  title: "Pagamento não concluído",
                  description: "O pagamento ainda não foi confirmado pela operadora. Se você acabou de pagar, aguarde alguns instantes e recarregue esta página.",
                  variant: "destructive",
                });
                return;
              }
            } catch {
              // Corpo não era JSON; segue com o erro genérico
            }
          }
          throw error;
        }

        if (data?.success) {
          setVerificationStatus('success');
          toast({
            title: "Pagamento confirmado!",
            description: "Seu plano foi atualizado com sucesso.",
          });
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('error');
        toast({
          title: "Erro na verificação",
          description: "Houve um problema ao verificar seu pagamento. Se você foi cobrado, entre em contato conosco.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {verificationStatus === 'loading' && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>
          
          <CardTitle>
            {verificationStatus === 'loading' && 'Verificando pagamento...'}
            {verificationStatus === 'success' && 'Pagamento confirmado!'}
            {verificationStatus === 'error' && 'Erro na verificação'}
          </CardTitle>
          
          <CardDescription>
            {verificationStatus === 'loading' && 'Aguarde enquanto confirmamos seu pagamento.'}
            {verificationStatus === 'success' && 'Seu plano foi atualizado com sucesso. Agora você tem acesso a todos os recursos do seu novo plano!'}
            {verificationStatus === 'error' && 'Houve um problema ao verificar seu pagamento. Se você foi cobrado, entre em contato conosco.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Button 
            onClick={handleGoToDashboard}
            disabled={isVerifying}
            className="w-full"
          >
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;