import React, { useState } from 'react';
import { ChevronDown, Search, X, Plus } from 'lucide-react';

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

export default function InstagramContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Configuração
  const [canalInstagram, setCanalInstagram] = useState('# • insta');
  const [canalLogsVerificacao, setCanalLogsVerificacao] = useState('#log-verificacao-insta');
  const [cargosPermissaoVerificacao, setCargosPermissaoVerificacao] = useState(['gg', '@god', '@r6']);
  const [cargosVerificado, setCargosVerificado] = useState(['@insta']);

  // Estados para Comandos
  const [commands] = useState([
    { name: '/resetverificacoes', description: 'Utilize para resetar os dados de verificação de todos os staffs.', enabled: true },
    { name: '/instagram', description: 'Utilize para vincular um instagram ao seu perfil.', enabled: true }
  ]);

  const canaisOptions: DropdownOption[] = [
    { value: '# • insta', label: '# • insta' },
    { value: '#instagram', label: '#instagram' },
    { value: '#social', label: '#social' },
  ];

  const canalLogsOptions: DropdownOption[] = [
    { value: '#log-verificacao-insta', label: '#log-verificacao-insta' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#logs', label: '#logs' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'lista', label: 'Lista de Instagram' },
    { id: 'comandos', label: 'Comandos' },
    { id: 'ranking', label: 'Ranking' }
  ];

  const removerCargoPermissao = (index: number) => {
    setCargosPermissaoVerificacao(prev => prev.filter((_, i) => i !== index));
  };

  const removerCargoVerificado = (index: number) => {
    setCargosVerificado(prev => prev.filter((_, i) => i !== index));
  };

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConfiguracaoTab = () => (
    <div className="space-y-8">
      {/* Configurações de instagram */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Configurações de instagram</h2>
        
        <div className="border-l-4 border-purple-500 pl-6">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mb-6">
            Criar instagram
          </button>
          
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <Dropdown
              value={canalInstagram}
              onChange={setCanalInstagram}
              options={canaisOptions}
            />
          </div>
        </div>
      </div>

      {/* Configurações de verificação */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Configurações de verificação</h2>
        
        <div className="space-y-6">
          {/* Configure o canal de logs de verificação */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Configure o canal de logs de verificação</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                LOGS DE VERIFICAÇÃO
              </label>
              <div className="max-w-xs">
                <Dropdown
                  value={canalLogsVerificacao}
                  onChange={setCanalLogsVerificacao}
                  options={canalLogsOptions}
                />
              </div>
            </div>
          </div>

          {/* Cargos com permissão de verificação */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos com permissão de verificação</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
              {cargosPermissaoVerificacao.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoPermissao(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
          </div>

          {/* Cargos de verificado */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos de verificado</h3>
            
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
              {cargosVerificado.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoVerificado(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListaTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Lista de Instagram</h3>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400">Nenhum dado encontrado.</p>
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
          {filteredCommands.map((command, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium text-base mb-2">{command.name}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{command.description}</p>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Editar
                </button>
                <ToggleSwitch
                  enabled={command.enabled}
                  onChange={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRankingTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Ranking de Instagram</h3>
        <p className="text-gray-400 text-sm">
          Visualize o ranking dos membros com mais interações no Instagram.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuracao':
        return renderConfiguracaoTab();
      case 'lista':
        return renderListaTab();
      case 'comandos':
        return renderComandosTab();
      case 'ranking':
        return renderRankingTab();
      default:
        return renderConfiguracaoTab();
    }
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Instagram</h1>
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                Update
              </span>
            </div>
            <p className="text-gray-400">Permita que seus membros postem fotos, recebam curtidas e comentários.</p>
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
        <div className="max-w-4xl">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}