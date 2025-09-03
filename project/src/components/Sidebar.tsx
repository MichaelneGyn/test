import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Settings, 
  Shield, 
  DollarSign, 
  Lock, 
  Server, 
  Users, 
  MessageSquare, 
  Bot,
  ChevronDown,
  ChevronRight,
  UserPlus,
  AlertTriangle,
  Clock,
  FileText,
  User,
  Star,
  Camera,
  Hash,
  Ticket,
  Sparkles,
  Move,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['GERENCIAMENTO DE SERVIDOR', 'STAFF', 'SOCIAL', 'MISCELLANEOUS']);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';

  const setCurrentView = (view: string) => {
    setSearchParams({ view });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', view: 'overview' },
    { icon: Settings, label: 'Configurações', view: 'settings' },
    { icon: Shield, label: 'Permissões', view: 'permissions' },
    { icon: DollarSign, label: 'Financeiro', view: 'financial' },
  ];

  const protectionItems = [
    { icon: Lock, label: 'Proteção de Url', view: 'protecao-url' },
    { icon: Server, label: 'Proteção de Servidor', view: 'protecao-servidor' },
  ];

  const managementItems = [
    { icon: Bot, label: 'Autorole', view: 'autorole' },
    { icon: MessageSquare, label: 'Reações automática', view: 'reacoes-automatica' },
    { icon: FileText, label: 'Logs de Eventos', view: 'logs' },
    { icon: UserPlus, label: 'Bem vindo & Adeus', view: 'bem-vindo-adeus' },
    { icon: Shield, label: 'Moderação', view: 'moderacao' },
    { icon: Users, label: 'Contadores', view: 'contadores' },
    { icon: MessageSquare, label: 'Mensagens', view: 'mensagens' },
    { icon: AlertTriangle, label: 'Whitelist', view: 'whitelist' },
    { icon: UserCheck, label: 'Bio Checker', view: 'bio-checker' },
    { icon: Settings, label: 'Utilitários', view: 'utilitarios' },
  ];

  const staffItems = [
    { icon: Clock, label: 'Tempo em Call', view: 'tempo-call' },
    { icon: Move, label: 'Mov. Chat', view: 'mov-chat' },
    { icon: UserPlus, label: 'Mig & Rec', view: 'mig-rec' },
    { icon: FileText, label: 'Registro', view: 'registro' },
  ];

  const socialItems = [
    { icon: Star, label: 'Primeira Dama', view: 'primeira-dama' },
    { icon: Camera, label: 'Instagram', view: 'instagram' },
    { icon: Hash, label: 'Influencers', view: 'influencers' },
    { icon: User, label: 'Tellonym', view: 'tellonym' },
  ];

  const miscellaneousItems = [
    { icon: Ticket, label: 'Tickets', view: 'tickets' },
    { icon: Sparkles, label: 'Vips', view: 'vips' },
  ];

  return (
    <div className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">
                {user?.name || 'Usuário'}
              </span>
              {user?.username && (
                <span className="text-gray-400 text-xs">
                  @{user.username}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="px-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setCurrentView(item.view)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === item.view
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            } w-full text-left`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {!isCollapsed && item.label}
          </button>
        ))}

        {/* PROTEÇÃO Section */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('PROTEÇÃO')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            {expandedSections.includes('PROTEÇÃO') ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            {!isCollapsed && 'PROTEÇÃO'}
          </button>
          {expandedSections.includes('PROTEÇÃO') && (
            <div className="ml-4 space-y-1">
              {protectionItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.view && setCurrentView(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.view && currentView === item.view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } w-full text-left`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {!isCollapsed && item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GERENCIAMENTO DE SERVIDOR Section */}
        <div className="pt-2">
          <button
            onClick={() => toggleSection('GERENCIAMENTO DE SERVIDOR')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            {expandedSections.includes('GERENCIAMENTO DE SERVIDOR') ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            {!isCollapsed && 'GERENCIAMENTO DE SERVIDOR'}
          </button>
          {expandedSections.includes('GERENCIAMENTO DE SERVIDOR') && (
            <div className="ml-4 space-y-1">
              {managementItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.view && setCurrentView(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    item.view && currentView === item.view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } w-full text-left`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {!isCollapsed && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {'badge' in item && !isCollapsed && (
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                      {String(item.badge)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STAFF Section */}
        <div className="pt-2">
          <button
            onClick={() => toggleSection('STAFF')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            {expandedSections.includes('STAFF') ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            {!isCollapsed && 'STAFF'}
          </button>
          {expandedSections.includes('STAFF') && (
            <div className="ml-4 space-y-1">
              {staffItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.view && setCurrentView(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.view && currentView === item.view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } w-full text-left`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {!isCollapsed && item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SOCIAL Section */}
        <div className="pt-2">
          <button
            onClick={() => toggleSection('SOCIAL')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            {expandedSections.includes('SOCIAL') ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            {!isCollapsed && 'SOCIAL'}
          </button>
          {expandedSections.includes('SOCIAL') && (
            <div className="ml-4 space-y-1">
              {socialItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.view && setCurrentView(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    item.view && currentView === item.view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } w-full text-left`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {!isCollapsed && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {'badge' in item && !isCollapsed && (
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                      {String(item.badge)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MISCELLANEOUS Section */}
        <div className="pt-2">
          <button
            onClick={() => toggleSection('MISCELLANEOUS')}
            className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            {expandedSections.includes('MISCELLANEOUS') ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            {!isCollapsed && 'MISCELLANEOUS'}
          </button>
          {expandedSections.includes('MISCELLANEOUS') && (
            <div className="ml-4 space-y-1">
              {miscellaneousItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.view && setCurrentView(item.view)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.view && currentView === item.view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  } w-full text-left`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {!isCollapsed && item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}