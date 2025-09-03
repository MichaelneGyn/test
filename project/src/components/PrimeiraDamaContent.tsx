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

interface PermissionTagProps {
  role: string;
  count: number;
  onRemove: () => void;
}

function PermissionTag({ role, count, onRemove }: PermissionTagProps) {
  return (
    <div className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
      <span className="text-orange-400">{role}</span>
      <span className="text-gray-400">(PD: {count})</span>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-white transition-colors ml-2"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function PrimeiraDamaContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [cargoSelecionado, setCargoSelecionado] = useState('@primeira dama');
  const [permissoes, setPermissoes] = useState([
    { role: '@star', count: 5 },
    { role: '@exe', count: 3 },
    { role: '@xp', count: 2 },
    { role: '@up', count: 2 },
    { role: '@god', count: 5 }
  ]);

  const cargoOptions: DropdownOption[] = [
    { value: '@primeira dama', label: '@primeira dama' },
    { value: '@dama', label: '@dama' },
    { value: '@lady', label: '@lady' },
  ];

  const removerPermissao = (index: number) => {
    setPermissoes(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Primeira Dama</h1>
            <p className="text-gray-400">Configure a permissão de ter primeira dama.</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Lista de Damas */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Lista de Damas</h2>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-center text-gray-400">
                Nenhuma dama encontrada.
              </div>
            </div>
          </div>

          {/* Configure o cargo de primeira dama */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Configure o cargo de primeira dama</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                CARGO
              </label>
              <div className="max-w-xs">
                <Dropdown
                  value={cargoSelecionado}
                  onChange={setCargoSelecionado}
                  options={cargoOptions}
                />
              </div>
            </div>
          </div>

          {/* Permissões */}
          <div className="border-l-4 border-purple-500 pl-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Permissões ({permissoes.length})</h3>
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {permissoes.map((permissao, index) => (
                <PermissionTag
                  key={index}
                  role={permissao.role}
                  count={permissao.count}
                  onRemove={() => removerPermissao(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}