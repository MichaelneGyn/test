import React, { useState } from 'react';
import { Search, ChevronDown, Plus, X } from 'lucide-react';

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

interface SocialNetwork {
  name: string;
  emoji: string;
  link: string;
  expanded: boolean;
}

interface InfluencerPanel {
  id: string;
  name: string;
  emoji: string;
  canalPostagem: string;
  canalLogs: string;
  redesSociais: SocialNetwork[];
}

export default function InfluencersContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPanel, setEditingPanel] = useState<InfluencerPanel | null>(null);

  // Estados para o painel de edição
  const [panelName, setPanelName] = useState('influencer');
  const [panelEmoji, setPanelEmoji] = useState('💖');
  const [canalPostagem, setCanalPostagem] = useState('# - influencer');
  const [canalLogs, setCanalLogs] = useState('#logs-influ');

  // Estados para redes sociais
  const [redesSociais, setRedesSociais] = useState<SocialNetwork[]>([
    { name: 'rlxgataa', emoji: '', link: '', expanded: false },
    { name: 'pecadoscarnais', emoji: '', link: 'https://instagram.com/pecadoscarnais/', expanded: true },
    { name: 'beaamrqs', emoji: '', link: '', expanded: false },
    { name: 'yannakkl', emoji: '', link: '', expanded: false },
    { name: '6oftw', emoji: '', link: '', expanded: false },
    { name: 'anallzq', emoji: '', link: '', expanded: false },
    { name: 'gabvscon', emoji: '', link: '', expanded: false }
  ]);

  // Estados para comandos
  const [commands] = useState([
    { name: '/influencer', description: 'Utilize para gerenciar postagens de fotos vinculadas a redes sociais.', enabled: true }
  ]);

  const canaisPostagemOptions: DropdownOption[] = [
    { value: '# - influencer', label: '# - influencer' },
    { value: '#influencers', label: '#influencers' },
    { value: '#destaque', label: '#destaque' },
  ];

  const canaisLogsOptions: DropdownOption[] = [
    { value: '#logs-influ', label: '#logs-influ' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#logs', label: '#logs' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'comandos', label: 'Comandos' }
  ];

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRedeSocial = (index: number) => {
    setRedesSociais(prev => prev.map((rede, i) => 
      i === index ? { ...rede, expanded: !rede.expanded } : rede
    ));
  };

  const updateRedeSocial = (index: number, field: 'emoji' | 'link', value: string) => {
    setRedesSociais(prev => prev.map((rede, i) => 
      i === index ? { ...rede, [field]: value } : rede
    ));
  };

  const removerRedeSocial = (index: number) => {
    setRedesSociais(prev => prev.filter((_, i) => i !== index));
  };

  const adicionarRedeSocial = () => {
    setRedesSociais(prev => [...prev, { 
      name: 'nova_rede', 
      emoji: '', 
      link: '', 
      expanded: false 
    }]);
  };

  const handleNovoPanel = () => {
    setIsEditing(true);
    setEditingPanel({
      id: 'new',
      name: panelName,
      emoji: panelEmoji,
      canalPostagem,
      canalLogs,
      redesSociais
    });
  };

  const handleSalvarPanel = () => {
    // Aqui você salvaria o painel
    setIsEditing(false);
    setEditingPanel(null);
  };

  const renderConfiguracaoTab = () => {
    if (isEditing) {
      return (
        <div className="space-y-8">
          {/* Edição de painel */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-white font-medium mb-6 border-l-4 border-purple-500 pl-3">
              Edição de painel
            </h3>
            
            <div className="space-y-6">
              {/* Emoji e Nome */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Emoji <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                      {panelEmoji}
                    </div>
                    <input
                      type="text"
                      value={panelName}
                      onChange={(e) => setPanelName(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nome <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={panelName}
                    onChange={(e) => setPanelName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Canal de postagem e Canal de logs */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Canal de postagem <span className="text-red-400">*</span>
                  </label>
                  <Dropdown
                    value={canalPostagem}
                    onChange={setCanalPostagem}
                    options={canaisPostagemOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Canal de logs</label>
                  <Dropdown
                    value={canalLogs}
                    onChange={setCanalLogs}
                    options={canaisLogsOptions}
                  />
                </div>
              </div>

              {/* Redes sociais */}
              <div>
                <div className="flex items-center justify-between mb-4 border-l-4 border-purple-500 pl-3">
                  <h4 className="text-white font-medium">Redes sociais</h4>
                  <button
                    onClick={adicionarRedeSocial}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Adicionar rede social
                  </button>
                </div>
                
                <div className="space-y-3">
                  {redesSociais.map((rede, index) => (
                    <div key={index} className="bg-gray-900 rounded-lg border border-gray-600">
                      <button
                        onClick={() => toggleRedeSocial(index)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-gray-300">{rede.name}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                          rede.expanded ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {rede.expanded && (
                        <div className="p-4 border-t border-gray-700 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">
                                Emoji <span className="text-red-400">*</span>
                              </label>
                              <div className="flex items-center space-x-2">
                                <button className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                  <Plus className="w-4 h-4" />
                                </button>
                                <input
                                  type="text"
                                  value={rede.name}
                                  onChange={(e) => updateRedeSocial(index, 'emoji', e.target.value)}
                                  className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">
                                Link <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={rede.link}
                                onChange={(e) => updateRedeSocial(index, 'link', e.target.value)}
                                placeholder="https://instagram.com/username/"
                                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removerRedeSocial(index)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Configure os cargos de influencer */}
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-6">Configure os cargos de influencer</h3>
          
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleNovoPanel}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors ml-4"
            >
              Novo Painel (1/10)
            </button>
          </div>

          {/* Painel existente */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">influencer (ID: 1)</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuracao':
        return renderConfiguracaoTab();
      case 'comandos':
        return renderComandosTab();
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
            <h1 className="text-2xl font-bold text-white mb-2">Influencers</h1>
            <p className="text-gray-400">Configure canais a serem postados fotos de destaque vinculado a redes sociais.</p>
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