import React, { useState } from 'react';

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
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
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

export default function AutoroleContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [cargoEntrada, setCargoEntrada] = useState('');
  
  // Estados para os emblemas
  const [emblemas, setEmblemas] = useState({
    staff: 'Desativado',
    parceiro: 'Desativado',
    hypesquad: 'Desativado',
    bugHunter: 'Desativado',
    bugHunterGold: 'Desativado',
    hypesquadBravery: 'Desativado',
    hypesquadBrilliance: 'Desativado',
    hypesquadBalance: 'Desativado',
    apoiadorInicial: 'Desativado',
    desenvolvedorVerificado: 'Desativado',
    desenvolvedorAtivo: 'Desativado',
    moderadorCertificado: 'Desativado'
  });

  const cargoOptions: DropdownOption[] = [
    { value: 'Desativado', label: 'Desativado' },
    { value: '@Membro', label: '@Membro' },
    { value: '@Verificado', label: '@Verificado' },
    { value: '@Staff', label: '@Staff' },
    { value: '@VIP', label: '@VIP' },
  ];

  const updateEmblema = (key: string, value: string) => {
    setEmblemas(prev => ({ ...prev, [key]: value }));
  };

  const emblemData = [
    { key: 'staff', icon: '⚒️', title: 'EMBLEMA DE STAFF', color: 'text-blue-400' },
    { key: 'parceiro', icon: '🤝', title: 'EMBLEMA DE PARCEIRO', color: 'text-blue-400' },
    { key: 'hypesquad', icon: '🏆', title: 'EMBLEMA DE HYPESQUAD', color: 'text-yellow-400' },
    { key: 'bugHunter', icon: '🐛', title: 'EMBLEMA DE BUG HUNTER', color: 'text-green-400' },
    { key: 'bugHunterGold', icon: '🏅', title: 'EMBLEMA DE BUG HUNTER GOLD', color: 'text-yellow-400' },
    { key: 'hypesquadBravery', icon: '🛡️', title: 'EMBLEMA DE HYPESQUAD BRAVERY', color: 'text-purple-400' },
    { key: 'hypesquadBrilliance', icon: '🔥', title: 'EMBLEMA DE HYPESQUAD BRILLIANCE', color: 'text-red-400' },
    { key: 'hypesquadBalance', icon: '💎', title: 'EMBLEMA DE HYPESQUAD BALANCE', color: 'text-green-400' },
    { key: 'apoiadorInicial', icon: '⚪', title: 'EMBLEMA DE APOIADOR INICIAL', color: 'text-gray-400' },
    { key: 'desenvolvedorVerificado', icon: '🔵', title: 'EMBLEMA DE DESENVOLVEDOR VERIFICADO', color: 'text-blue-400' },
    { key: 'desenvolvedorAtivo', icon: '🟢', title: 'EMBLEMA DE DESENVOLVEDOR ATIVO', color: 'text-green-400' },
    { key: 'moderadorCertificado', icon: '🔵', title: 'EMBLEMA DE MODERADOR CERTIFICADO', color: 'text-blue-400' }
  ];

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Autorole</h1>
            <p className="text-gray-400">Autorole serve para você dar cargos para novos membros do seu servidor automaticamente quando eles entrarem no servidor</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Configure cargos de entrada */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">
              Configure cargos de entrada para novos membros
            </h3>
            
            <div className="mb-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                CARGOS: 0
              </span>
              
              <div className="mt-2 max-w-xs">
                <Dropdown
                  value={cargoEntrada}
                  onChange={setCargoEntrada}
                  options={cargoOptions}
                  placeholder="Selecione um cargo"
                />
              </div>
            </div>
          </div>

          {/* Cargo por Emblemas */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-6">Cargo por Emblemas</h3>
            
            <div className="grid grid-cols-3 gap-6">
              {emblemData.map((emblem) => (
                <div key={emblem.key} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{emblem.icon}</span>
                    <span className={`text-xs font-medium uppercase tracking-wider ${emblem.color}`}>
                      {emblem.title}
                    </span>
                  </div>
                  <Dropdown
                    value={emblemas[emblem.key as keyof typeof emblemas]}
                    onChange={(value) => updateEmblema(emblem.key, value)}
                    options={cargoOptions}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}