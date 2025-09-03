import React, { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

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
      <X className="w-3 h-3 mr-1" />
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

export default function MigRecContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');

  // Estados para Recrutamento
  const [logsRecrutamento, setLogsRecrutamento] = useState('#log-cargo');
  const [cargosRecrutar, setCargosRecrutar] = useState(['@mig']);
  const [cargosRecrutamento, setCargosRecrutamento] = useState([]);

  // Estados para Migração
  const [logsMigracao, setLogsMigracao] = useState('#logs-mig');
  const [cargosMigracao, setCargosMigracao] = useState(['@mig', '@^']);
  const [cargosGlobais, setCargosGlobais] = useState([]);
  const [cargosMigracaoSetados, setCargosMigracaoSetados] = useState([]);

  const canaisOptions: DropdownOption[] = [
    { value: '#log-cargo', label: '#log-cargo' },
    { value: '#logs-mig', label: '#logs-mig' },
    { value: '#logs-geral', label: '#logs-geral' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'comandos', label: 'Comandos' },
    { id: 'ranking', label: 'Ranking' }
  ];

  const removerCargoRecrutar = (index: number) => {
    setCargosRecrutar(prev => prev.filter((_, i) => i !== index));
  };

  const removerCargoMigracao = (index: number) => {
    setCargosMigracao(prev => prev.filter((_, i) => i !== index));
  };

  const renderConfiguracaoTab = () => (
    <div className="space-y-12">
      {/* Recrutamento */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-8">Recrutamento</h2>
        
        <div className="space-y-8">
          {/* Configure o canal de logs */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Configure o canal de logs</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Logs de recrutamentos</label>
              <div className="max-w-xs">
                <Dropdown
                  value={logsRecrutamento}
                  onChange={setLogsRecrutamento}
                  options={canaisOptions}
                />
              </div>
            </div>
          </div>

          {/* Cargos com permissão de recrutar */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos com permissão de recrutar</h3>
            
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
              {cargosRecrutar.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoRecrutar(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
          </div>

          {/* Cargos de recrutamento */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos de recrutamento (Que serão setados no membro após o comando)</h3>
            
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Migração */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-8">Migração</h2>
        
        <div className="space-y-8">
          {/* Configure o canal de logs */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Configure o canal de logs</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Logs de migrações</label>
              <div className="max-w-xs">
                <Dropdown
                  value={logsMigracao}
                  onChange={setLogsMigracao}
                  options={canaisOptions}
                />
              </div>
            </div>
          </div>

          {/* Cargos que poderão realizar migrações */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos que poderão realizar migrações</h3>
            
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
              {cargosMigracao.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoMigracao(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
          </div>

          {/* Cargos globais */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos globais (Que serão setados no membro após o comando)</h3>
            
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Cargos de migração */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos de migração</h3>
            
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Adicionar Opção
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComandosTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Lista de comandos</h3>
        <p className="text-gray-400 text-sm">
          Comandos para migração e recrutamento serão exibidos aqui.
        </p>
      </div>
    </div>
  );

  const renderRankingTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Ranking de migrações e recrutamentos</h3>
        <p className="text-gray-400 text-sm">
          Visualize o ranking dos membros com mais migrações e recrutamentos.
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
            <h1 className="text-2xl font-bold text-white mb-2">Mig & Rec</h1>
            <p className="text-gray-400">Configure os sistemas de migração e recrutamento</p>
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