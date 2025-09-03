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

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

function Slider({ value, onChange, min, max }: SliderProps) {
  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
        }}
      />
      <div 
        className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-lg"
        style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 10px)` }}
      >
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function MovChatContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Configuração
  const [cargosContagem, setCargosContagem] = useState(['@move on']);
  const [cargoSelecionado, setCargoSelecionado] = useState('Selecione um cargo');
  const [canalSelecionado, setCanalSelecionado] = useState('Selecione um canal');
  const [limiteMensagem, setLimiteMensagem] = useState(1);
  const [porSegundos, setPorSegundos] = useState(1);

  // Estados para Comandos
  const [commands] = useState([
    { name: '/resetmovchat', description: 'Utilize para resetar os dados de Mov. Chat de todos os membros.', enabled: true }
  ]);

  const cargoOptions: DropdownOption[] = [
    { value: 'Selecione um cargo', label: 'Selecione um cargo' },
    { value: '@staff', label: '@staff' },
    { value: '@moderador', label: '@moderador' },
    { value: '@admin', label: '@admin' },
  ];

  const canalOptions: DropdownOption[] = [
    { value: 'Selecione um canal', label: 'Selecione um canal' },
    { value: '#geral', label: '#geral' },
    { value: '#chat', label: '#chat' },
    { value: '#staff', label: '#staff' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'comandos', label: 'Comandos' },
    { id: 'ranking', label: 'Ranking' }
  ];

  const removerCargo = (index: number) => {
    setCargosContagem(prev => prev.filter((_, i) => i !== index));
  };

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConfiguracaoTab = () => (
    <div className="space-y-8">
      {/* Configure cargos que contarão mensagens */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Configure cargos que contarão mensagens</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              CARGOS: {cargosContagem.length}
            </span>
            <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
              LIMPAR
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {cargosContagem.map((cargo, index) => (
              <Tag key={index} onRemove={() => removerCargo(index)}>
                {cargo}
              </Tag>
            ))}
          </div>
          
          <div className="max-w-xs">
            <Dropdown
              value={cargoSelecionado}
              onChange={setCargoSelecionado}
              options={cargoOptions}
            />
          </div>
        </div>
      </div>

      {/* Configure canais de texto que contarão mensagens */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Configure canais de texto que contarão mensagens</h3>
        
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            CANAIS: 0
          </span>
          
          <div className="mt-2 max-w-xs">
            <Dropdown
              value={canalSelecionado}
              onChange={setCanalSelecionado}
              options={canalOptions}
            />
          </div>
        </div>
      </div>

      {/* Limite de Mensagem */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Limite de Mensagem</h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm">1</span>
          <span className="text-white text-sm">60</span>
        </div>
        
        <Slider
          value={limiteMensagem}
          onChange={setLimiteMensagem}
          min={1}
          max={60}
        />
      </div>

      {/* Por segundos */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Por segundos</h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm">1</span>
          <span className="text-white text-sm">60</span>
        </div>
        
        <Slider
          value={porSegundos}
          onChange={setPorSegundos}
          min={1}
          max={60}
        />
      </div>
    </div>
  );

  const renderComandosTab = () => (
    <div className="space-y-8">
      {/* Lista de comandos */}
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
            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">{command.name}</h4>
                <p className="text-gray-400 text-sm">{command.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
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
        <h3 className="text-white font-medium mb-4">Ranking de movimentação de chat</h3>
        <p className="text-gray-400 text-sm">
          Visualize o ranking dos membros com mais movimentação de chat no servidor.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuracao':
        return renderConfiguracaoTab();
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
            <h1 className="text-2xl font-bold text-white mb-2">Mov. Chat</h1>
            <p className="text-gray-400">Contabilize as mensagens em canais de texto de seus staffs.</p>
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