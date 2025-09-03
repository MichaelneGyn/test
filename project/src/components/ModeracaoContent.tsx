import React, { useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
}

function Dropdown({ value, onChange, options, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-between"
      >
        <span>{selectedOption?.label || placeholder || 'Selecionar'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-purple-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

interface TagProps {
  children: React.ReactNode;
  onRemove: () => void;
}

function Tag({ children, onRemove }: TagProps) {
  return (
    <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center">
      <span>{children}</span>
      <button
        onClick={onRemove}
        className="ml-2 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function ModeracaoContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('automod');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Automod
  const [automodConfigs, setAutomodConfigs] = useState({
    antiSpam: 'Deletar mensagem',
    palavrasBloqueadas: 'Desativado',
    textoDuplicado: 'Deletar mensagem',
    antiInvites: 'Deletar mensagem',
    antiLinks: 'Deletar mensagem',
    capsExcesso: 'Desativado',
    emojisExcesso: 'Deletar mensagem',
    mencoesExcesso: 'Deletar mensagem',
    zalgo: 'Desativado'
  });

  // Estados para Moderação
  const [cargoMutado, setCargoMutado] = useState('@mute');

  // Estados para Audit Logs
  const [auditLogsConfigs, setAuditLogsConfigs] = useState({
    logsBanimentos: '#logs-de-banimentos',
    logsMutes: '#logs-de-mutes',
    logsExpulsoes: '#logs-de-expulsões',
    logsAdvertencias: '#logs-de-advertências',
    logsCastigos: '#logs-de-castigos'
  });

  // Estados para Comandos
  const [comandos] = useState([
    { name: '/ban', description: 'Bane um membro.', enabled: true },
    { name: '/unban', description: 'Desbane um membro.', enabled: true },
    { name: '/kick', description: 'Expulse um membro no servidor.', enabled: true },
    { name: '/mute', description: 'Mute um membro no servidor.', enabled: true },
    { name: '/unmute', description: 'Desmute um membro em canais de voz no servidor.', enabled: true },
    { name: '/mutecall', description: 'Mute um membro em canais de voz no servidor.', enabled: true },
    { name: '/unmutecall', description: 'Desmute um membro em canais de voz no servidor.', enabled: true },
    { name: '/lock', description: 'Impeça que os usuários falem no canal de texto onde o comando foi executado.', enabled: true },
    { name: '/unlock', description: 'Permita que os usuários falem no canal de texto onde o comando foi executado.', enabled: true },
    { name: '/unbanall', description: 'Desbanir todos os membros do servidor. (Exceto blacklist)', enabled: true },
    { name: '/blacklist', description: 'Utilize para vincular um instagram ao seu perfil.', enabled: true },
    { name: '/advertence', description: 'Advertir um membro.', enabled: true },
    { name: '/removeadvertence', description: 'Remover advertência de um membro.', enabled: true },
    { name: '/castigar', description: 'Castigar um membro.', enabled: true },
    { name: '/removecastigo', description: 'Remover o castigo de um membro no servidor.', enabled: true },
    { name: '/nuke', description: 'Recrle um chat.', enabled: true }
  ]);

  // Estados para notificações
  const [notificacoes, setNotificacoes] = useState({
    notificarBanimentos: true,
    notificarExpulsoes: true,
    notificarAdvertencias: true
  });

  // Estados para cargos de imunidade
  const [cargosImunidade, setCargosImunidade] = useState(['@sr6', '@star', '@exe']);

  const dropdownOptions: DropdownOption[] = [
    { value: 'Deletar mensagem', label: 'Deletar mensagem' },
    { value: 'Desativado', label: 'Desativado' },
    { value: 'Timeout', label: 'Timeout' },
    { value: 'Advertir', label: 'Advertir' }
  ];

  const cargoOptions: DropdownOption[] = [
    { value: '@mute', label: '@mute' },
    { value: '@silenciado', label: '@silenciado' },
    { value: '@timeout', label: '@timeout' }
  ];

  const canalOptions: DropdownOption[] = [
    { value: '#logs-de-banimentos', label: '#logs-de-banimentos' },
    { value: '#logs-de-mutes', label: '#logs-de-mutes' },
    { value: '#logs-de-expulsões', label: '#logs-de-expulsões' },
    { value: '#logs-de-advertências', label: '#logs-de-advertências' },
    { value: '#logs-de-castigos', label: '#logs-de-castigos' }
  ];

  const tabs = [
    { id: 'automod', label: 'Automod' },
    { id: 'moderacao', label: 'Moderação' },
    { id: 'audit-logs', label: 'Audit Logs' },
    { id: 'comandos', label: 'Comandos' }
  ];

  const updateAutomodConfig = (key: string, value: string) => {
    setAutomodConfigs(prev => ({ ...prev, [key]: value }));
  };

  const updateAuditLogsConfig = (key: string, value: string) => {
    setAuditLogsConfigs(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificacao = (key: string, value: boolean) => {
    setNotificacoes(prev => ({ ...prev, [key]: value }));
  };

  const removerCargoImunidade = (index: number) => {
    setCargosImunidade(prev => prev.filter((_, i) => i !== index));
  };

  const filteredComandos = comandos.filter(comando => 
    comando.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comando.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAutomodTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">
          O Automod é uma ação de moderação automática. Você pode configurar as ações que serão executadas quando essas ações forem acionadas abaixo
        </h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ANTI-SPAM</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.antiSpam}
              onChange={(value) => updateAutomodConfig('antiSpam', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">PALAVRAS BLOQUEADAS</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.palavrasBloqueadas}
              onChange={(value) => updateAutomodConfig('palavrasBloqueadas', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">TEXTO DUPLICADO</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.textoDuplicado}
              onChange={(value) => updateAutomodConfig('textoDuplicado', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ANTI INVITES</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.antiInvites}
              onChange={(value) => updateAutomodConfig('antiInvites', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ANTI LINKS</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.antiLinks}
              onChange={(value) => updateAutomodConfig('antiLinks', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">CAPS EM EXCESSO (70% &gt; CAPS)</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.capsExcesso}
              onChange={(value) => updateAutomodConfig('capsExcesso', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">EMOJIS EM EXCESSO</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.emojisExcesso}
              onChange={(value) => updateAutomodConfig('emojisExcesso', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">MENÇÕES EM EXCESSO</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.mencoesExcesso}
              onChange={(value) => updateAutomodConfig('mencoesExcesso', value)}
              options={dropdownOptions}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">ZALGO</span>
              <button className="text-gray-500 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <Dropdown
              value={automodConfigs.zalgo}
              onChange={(value) => updateAutomodConfig('zalgo', value)}
              options={dropdownOptions}
            />
          </div>
        </div>
      </div>

      {/* Cargos de imunidade */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Cargos de imunidade</h2>
        
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-4">
            Membros com algum desses cargos não serão afetados pelo Automod. A Kally, Posse, membros com permissão de administração são imunes por padrão.
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                CARGOS: 3
              </span>
              <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                LIMPAR
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {cargosImunidade.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoImunidade(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
            
            <div className="max-w-xs">
              <Dropdown
                value=""
                onChange={() => {}}
                options={cargoOptions}
                placeholder="Selecione um cargo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeracaoTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Cargo de membro mutado</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={cargoMutado}
            onChange={setCargoMutado}
            options={cargoOptions}
          />
        </div>
      </div>

      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configurações de advertências <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs ml-2">BETA</span>
        </h3>
        
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Criar advertência
        </button>
      </div>

      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Configurações de punições</h3>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium mb-1">Notificar banimentos</h4>
              <p className="text-gray-400 text-sm">
                Notificar membro via Mensagem Direta ao ser aplicado um banimento
              </p>
            </div>
            <ToggleSwitch
              enabled={notificacoes.notificarBanimentos}
              onChange={(value) => updateNotificacao('notificarBanimentos', value)}
            />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium mb-1">Notificar expulsões</h4>
              <p className="text-gray-400 text-sm">
                Notificar membro via Mensagem Direta ao ser aplicado uma expulsão
              </p>
            </div>
            <ToggleSwitch
              enabled={notificacoes.notificarExpulsoes}
              onChange={(value) => updateNotificacao('notificarExpulsoes', value)}
            />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium mb-1">Notificar advertências</h4>
              <p className="text-gray-400 text-sm">
                Notificar membro via Mensagem Direta ao ser aplicado uma advertência
              </p>
            </div>
            <ToggleSwitch
              enabled={notificacoes.notificarAdvertencias}
              onChange={(value) => updateNotificacao('notificarAdvertencias', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogsTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Logs de moderação</h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LOGS DE BANIMENTOS
            </label>
            <Dropdown
              value={auditLogsConfigs.logsBanimentos}
              onChange={(value) => updateAuditLogsConfig('logsBanimentos', value)}
              options={canalOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LOGS DE MUTES
            </label>
            <Dropdown
              value={auditLogsConfigs.logsMutes}
              onChange={(value) => updateAuditLogsConfig('logsMutes', value)}
              options={canalOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LOGS DE EXPULSÕES
            </label>
            <Dropdown
              value={auditLogsConfigs.logsExpulsoes}
              onChange={(value) => updateAuditLogsConfig('logsExpulsoes', value)}
              options={canalOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LOGS DE ADVERTÊNCIAS
            </label>
            <Dropdown
              value={auditLogsConfigs.logsAdvertencias}
              onChange={(value) => updateAuditLogsConfig('logsAdvertencias', value)}
              options={canalOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LOGS DE CASTIGOS
            </label>
            <Dropdown
              value={auditLogsConfigs.logsCastigos}
              onChange={(value) => updateAuditLogsConfig('logsCastigos', value)}
              options={canalOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderComandosTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Lista de comandos</h3>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          {filteredComandos.map((comando, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">{comando.name}</h4>
                <p className="text-gray-400 text-sm">{comando.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Editar
                </button>
                <ToggleSwitch
                  enabled={comando.enabled}
                  onChange={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'automod':
        return renderAutomodTab();
      case 'moderacao':
        return renderModeracaoTab();
      case 'audit-logs':
        return renderAuditLogsTab();
      case 'comandos':
        return renderComandosTab();
      default:
        return renderAutomodTab();
    }
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Moderação</h1>
            <p className="text-gray-400">Mantenha seu servidor seguro com moderação automática e capacite seus moderadores com poderosas ferramentas de moderação</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}