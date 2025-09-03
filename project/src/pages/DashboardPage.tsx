import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import LogsEventosContent from '../components/LogsEventosContent';
import DashboardFeaturesContent from '../components/DashboardFeaturesContent';
import PermissionsContent from '../components/PermissionsContent';
import ConfiguracoesContent from '../components/ConfiguracoesContent';
import FinanceiroContent from '../components/FinanceiroContent';
import ProtecaoUrlContent from '../components/ProtecaoUrlContent';
import ProtecaoServidorContent from '../components/ProtecaoServidorContent';
import AutoroleContent from '../components/AutoroleContent';
import ReacoesAutomaticaContent from '../components/ReacoesAutomaticaContent';
import BemVindoAdeusContent from '../components/BemVindoAdeusContent';
import ModeracaoContent from '../components/ModeracaoContent';
import ContadoresContent from '../components/ContadoresContent';
import WhitelistContent from '../components/WhitelistContent';
import BioCheckerContent from '../components/BioCheckerContent';
import UtilitariosContent from '../components/UtilitariosContent';
import TempoCallContent from '../components/TempoCallContent';
import MensagensContent from '../components/MensagensContent';
import MovChatContent from '../components/MovChatContent';
import MigRecContent from '../components/MigRecContent';
import PrimeiraDamaContent from '../components/PrimeiraDamaContent';
import InstagramContent from '../components/InstagramContent';
import InfluencersContent from '../components/InfluencersContent';
import RegistroContent from '../components/RegistroContent';
import TellonymContent from '../components/TellonymContent';
import TicketsContent from '../components/TicketsContent';
import VipsContent from '../components/VipsContent';

export default function DashboardPage() {
  const { user } = useAuth();
  const [sidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';


  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">Você precisa estar logado para acessar o dashboard.</p>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  const DashboardOverview = () => (
    <DashboardFeaturesContent />
  );

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
      />
      
      <div className="flex-1 bg-gray-900 min-h-screen">
        {currentView === 'overview' && <DashboardOverview />}
        {currentView === 'logs' && <LogsEventosContent />}
        {currentView === 'settings' && <ConfiguracoesContent />}
        {currentView === 'permissions' && <PermissionsContent />}
        {currentView === 'financial' && <FinanceiroContent />}
        {currentView === 'protecao-url' && <ProtecaoUrlContent />}
        {currentView === 'protecao-servidor' && <ProtecaoServidorContent />}
        {currentView === 'autorole' && <AutoroleContent />}
        {currentView === 'reacoes-automatica' && <ReacoesAutomaticaContent />}
        {currentView === 'bem-vindo-adeus' && <BemVindoAdeusContent />}
        {currentView === 'moderacao' && <ModeracaoContent />}
        {currentView === 'contadores' && <ContadoresContent />}
        {currentView === 'whitelist' && <WhitelistContent />}
        {currentView === 'bio-checker' && <BioCheckerContent />}
        {currentView === 'utilitarios' && <UtilitariosContent />}
        {currentView === 'tempo-call' && <TempoCallContent />}
        {currentView === 'mensagens' && <MensagensContent />}
        {currentView === 'mov-chat' && <MovChatContent />}
        {currentView === 'mig-rec' && <MigRecContent />}
        {currentView === 'primeira-dama' && <PrimeiraDamaContent />}
        {currentView === 'instagram' && <InstagramContent />}
        {currentView === 'influencers' && <InfluencersContent />}
        {currentView === 'registro' && <RegistroContent />}
        {currentView === 'tellonym' && <TellonymContent />}
        {currentView === 'tickets' && <TicketsContent />}
        {currentView === 'vips' && <VipsContent />}
      </div>
    </div>
  );
}