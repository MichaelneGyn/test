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

export default function ProtecaoUrlContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [conta, setConta] = useState('');
  const [urlOriginal, setUrlOriginal] = useState('folk');
  const [canalLogs, setCanalLogs] = useState('#log-proteção');
  const [punicao, setPunicao] = useState('Banir do servidor');

  const canaisOptions: DropdownOption[] = [
    { value: '#log-proteção', label: '#log-proteção' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#moderação', label: '#moderação' },
  ];

  const punicaoOptions: DropdownOption[] = [
    { value: 'Banir do servidor', label: 'Banir do servidor' },
    { value: 'Expulsar do servidor', label: 'Expulsar do servidor' },
    { value: 'Timeout', label: 'Timeout' },
    { value: 'Apenas alertar', label: 'Apenas alertar' },
  ];

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Proteção de Url</h1>
            <p className="text-gray-400">Mantenha a url do seu servidor protegida e evite que pessoas má intencionadas tomem posse.</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8 max-w-2xl">
          {/* Conta */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">
              Conta (Veja nosso tutorial no servidor de suporte em caso de dúvidas)
            </h3>
            
            <textarea
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Digite as informações da conta..."
            />
          </div>

          {/* URL Original */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">URL Original</h3>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">discord.gg/</span>
              <input
                type="text"
                value={urlOriginal}
                onChange={(e) => setUrlOriginal(e.target.value)}
                className="flex-1 max-w-xs bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Canal de Logs */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Defina um canal de logs para a proteção</h3>
            
            <div className="max-w-xs">
              <Dropdown
                value={canalLogs}
                onChange={setCanalLogs}
                options={canaisOptions}
              />
            </div>
          </div>

          {/* Punição */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Punição aplicada ao alterar a url do servidor</h3>
            
            <div className="max-w-xs">
              <Dropdown
                value={punicao}
                onChange={setPunicao}
                options={punicaoOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}