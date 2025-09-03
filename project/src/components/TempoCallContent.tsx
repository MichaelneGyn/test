import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

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

export default function TempoCallContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Configuração
  const [cargoSelecionado, setCargoSelecionado] = useState('Selecione um cargo');
  const [canalSelecionado, setCanalSelecionado] = useState('Selecione um canal');
  const [contabilizarMutado, setContabilizarMutado] = useState(true);
  const [sistemaMovimentacao, setSistemaMovimentacao] = useState(true);
  const [permitirTrocarCanal, setPermitirTrocarCanal] = useState(false);
  const [tempoMovimentacao, setTempoMovimentacao] = useState('60');
  const [pontosMovimentacao, setPontosMovimentacao] = useState('1');
  const [canalLogs, setCanalLogs] = useState('Selecione um canal');

  // Estados para Comandos
  const commands = [
    { name: '/resettime', description: 'Utilize para resetar o tempo em call de todos os membros.', enabled: true },
    { name: '/resetmovs', description: 'Utilize para resetar as movimentações de todos os membros.', enabled: true },
    { name: '/movpoints', description: 'Utilize para gerenciar pontos de movimentação.', enabled: true }
  ];

  const cargoOptions: DropdownOption[] = [
    { value: 'Selecione um cargo', label: 'Selecione um cargo' },
    { value: '@staff', label: '@staff' },
    { value: '@moderador', label: '@moderador' },
    { value: '@admin', label: '@admin' },
  ];

  const canalOptions: DropdownOption[] = [
    { value: 'Selecione um canal', label: 'Selecione um canal' },
    { value: '#logs-call', label: '#logs-call' },
    { value: '#logs-geral', label: '#logs-geral' },
    { value: '#moderacao', label: '#moderacao' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'comandos', label: 'Comandos' },
    { id: 'ranking', label: 'Ranking' }
  ];

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConfiguracaoTab = () => (
    <div className="space-y-8">
      {/* Configure cargos que contarão tempo em call */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Configure cargos que contarão tempo em call</h3>
        
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            CARGOS: 0
          </span>
          
          <div className="mt-2 max-w-xs">
            <Dropdown
              value={cargoSelecionado}
              onChange={setCargoSelecionado}
              options={cargoOptions}
            />
          </div>
        </div>
      </div>

      {/* Configure canais que contarão tempo em call */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Configure canais que contarão tempo em call</h3>
        
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            ADICIONAR CANAL
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

      {/* Contabilizar mutado */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">Contabilizar mutado</h3>
            <p className="text-gray-400 text-sm">
              Permitir que conte tempo em call de membro mutado
            </p>
          </div>
          <ToggleSwitch
            enabled={contabilizarMutado}
            onChange={setContabilizarMutado}
          />
        </div>

        {/* Sistema de movimentação */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-white font-medium">Sistema de movimentação</h3>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                BETA
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Permitir que staffs utilizem o sistema de movimentação
            </p>
          </div>
          <ToggleSwitch
            enabled={sistemaMovimentacao}
            onChange={setSistemaMovimentacao}
          />
        </div>

        {/* Permitir trocar de canal */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">Permitir trocar de canal</h3>
            <p className="text-gray-400 text-sm">
              Permitir que staffs mudem de canal de voz durante uma movimentação
            </p>
          </div>
          <ToggleSwitch
            enabled={permitirTrocarCanal}
            onChange={setPermitirTrocarCanal}
          />
        </div>

        {/* Tempo e pontos de movimentação */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Tempo de movimentação</label>
            <input
              type="text"
              value={tempoMovimentacao}
              onChange={(e) => setTempoMovimentacao(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Pontos por movimentação</label>
            <input
              type="text"
              value={pontosMovimentacao}
              onChange={(e) => setPontosMovimentacao(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Canal de Logs */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Canal de Logs</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={canalLogs}
            onChange={setCanalLogs}
            options={canalOptions}
          />
        </div>
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
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        <h3 className="text-white font-medium mb-4">Ranking de tempo em call</h3>
        <p className="text-gray-400 text-sm">
          Visualize o ranking dos membros com mais tempo em call no servidor.
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
            <h1 className="text-2xl font-bold text-white mb-2">Tempo em Call</h1>
            <p className="text-gray-400">Contabilize o tempo em call dos membros em seu servidor.</p>
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