import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { handleDiscordCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleDiscordCallback();
        // Redirecionar para o dashboard após login bem-sucedido
        navigate('/dashboard');
      } catch (error) {
        console.error('Erro no callback:', error);
        // Redirecionar para home em caso de erro
        navigate('/');
      }
    };

    processCallback();
  }, [handleDiscordCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Processando login...</h2>
        <p className="text-gray-400">Aguarde enquanto conectamos sua conta Discord.</p>
      </div>
    </div>
  );
}