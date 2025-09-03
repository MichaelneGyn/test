import React, { useState } from 'react';
import { Plus } from 'lucide-react';

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

interface EmojiButtonProps {
  number: number;
  onClick: () => void;
}

function EmojiButton({ number, onClick }: EmojiButtonProps) {
  return (
    <div className="text-center">
      <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
        NÚMERO {number}
      </div>
      <button
        onClick={onClick}
        className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
      >
        <Plus className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}

export default function ContadoresContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  
  // Estados para Contador de membros
  const [canalMembros, setCanalMembros] = useState('Desativado');
  const [mensagemMembros, setMensagemMembros] = useState('');
  
  // Estados para Contador de membros em call
  const [canalCall, setCanalCall] = useState('#connect: 1');
  const [mensagemCall, setMensagemCall] = useState('connect: %');

  const canaisOptions: DropdownOption[] = [
    { value: 'Desativado', label: 'Desativado' },
    { value: '#geral', label: '#geral' },
    { value: '#contador', label: '#contador' },
    { value: '#membros', label: '#membros' },
  ];

  const canaisCallOptions: DropdownOption[] = [
    { value: '#connect: 1', label: '#connect: 1' },
    { value: '#call-counter', label: '#call-counter' },
    { value: '#voice-count', label: '#voice-count' },
  ];

  const handleEmojiClick = (number: number) => {
    console.log(`Emoji ${number} clicked`);
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Contadores</h1>
            <p className="text-gray-400">Configure contadores de membros em call ou da quantidade de membros em seu servidor.</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* Contador de membros */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Contador de membros</h2>
            
            <div className="space-y-6">
              {/* Configure um canal */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">
                  Configure um canal para contar o total de membros em seu servidor
                </h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    CANAL
                  </label>
                  <div className="max-w-xs">
                    <Dropdown
                      value={canalMembros}
                      onChange={setCanalMembros}
                      options={canaisOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Mensagem */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">Mensagem</h3>
                
                <textarea
                  value={mensagemMembros}
                  onChange={(e) => setMensagemMembros(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Digite um tópico para o canal..."
                />
                
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Variáveis de texto:</h4>
                  <div className="text-sm">
                    <span className="text-purple-400">{'{counter}'}</span>
                    <span className="text-gray-400"> - Será substituído pela quantidade de membros no servidor</span>
                  </div>
                </div>
              </div>

              {/* Emojis */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-6">Emojis</h3>
                
                <div className="grid grid-cols-5 gap-6">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <EmojiButton
                      key={num}
                      number={num}
                      onClick={() => handleEmojiClick(num)}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-6 mt-6">
                  {[5, 6, 7, 8, 9].map((num) => (
                    <EmojiButton
                      key={num}
                      number={num}
                      onClick={() => handleEmojiClick(num)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contador de membros em call */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Contador de membros em call</h2>
            
            <div className="space-y-6">
              {/* Configure um canal */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">
                  Configure um canal para contar a quantidade de membros em call no seu servidor
                </h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    CANAL
                  </label>
                  <div className="max-w-xs">
                    <Dropdown
                      value={canalCall}
                      onChange={setCanalCall}
                      options={canaisCallOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Mensagem */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">Mensagem</h3>
                
                <input
                  type="text"
                  value={mensagemCall}
                  onChange={(e) => setMensagemCall(e.target.value)}
                  className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Variáveis de texto:</h4>
                  <div className="text-sm">
                    <span className="text-purple-400">%</span>
                    <span className="text-gray-400"> - Será substituído pela quantidade de membros em call</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}