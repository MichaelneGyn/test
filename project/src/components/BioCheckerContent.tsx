import React, { useState } from 'react';
import { X } from 'lucide-react';

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

export default function BioCheckerContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [conta, setConta] = useState('');
  const [textoVerificacao, setTextoVerificacao] = useState('folk flk');
  const [cargosChecados, setCargosChecados] = useState(['@star', '@exe', '@xp', '@god', '@up']);
  const [canalLogs, setCanalLogs] = useState('#moderator-only');

  const canalLogsOptions: DropdownOption[] = [
    { value: '#moderator-only', label: '#moderator-only' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#logs', label: '#logs' },
  ];

  const removerCargo = (index: number) => {
    setCargosChecados(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Bio Checker</h1>
            <p className="text-gray-400">Verifique automaticamente os usuários que possuem algo na bio, status ou pronome.</p>
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
              rows={3}
              placeholder=""
            />
          </div>

          {/* Texto a ser verificado no perfil dos usuários */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Texto a ser verificado no perfil dos usuários</h3>
            
            <input
              type="text"
              value={textoVerificacao}
              onChange={(e) => setTextoVerificacao(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Cargos a serem checados */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos a serem checados</h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <span className="text-gray-300 text-sm">+</span>
              </button>
              {cargosChecados.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargo(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
          </div>

          {/* Configure um canal de logs */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Configure um canal de logs</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Canal de logs</label>
              <div className="max-w-xs">
                <Dropdown
                  value={canalLogs}
                  onChange={setCanalLogs}
                  options={canalLogsOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}