import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

export default function BemVindoAdeusContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [ativarMensagemSaida, setAtivarMensagemSaida] = useState(true);
  const [canalSaida, setCanalSaida] = useState('Selecione um canal');
  const [tempoDelecao, setTempoDelecao] = useState('0');
  const [mensagemTexto, setMensagemTexto] = useState('');

  const canaisOptions: DropdownOption[] = [
    { value: 'Selecione um canal', label: 'Selecione um canal' },
    { value: '#bem-vindos', label: '#bem-vindos' },
    { value: '#geral', label: '#geral' },
    { value: '#saídas', label: '#saídas' },
  ];

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Bem vindo & Adeus</h1>
            <p className="text-gray-400">Anuncie quem está entrando e saindo do seu servidor da maneira que você queria!</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Mensagens de boas vindas */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Mensagens de boas vindas</h2>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-white font-medium mb-4">
                Você pode configurar mais de um canal para receber mensagens de boas vindas
              </h3>
              
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Não configurado.</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
                Criar mensagem
              </button>
            </div>
          </div>

          {/* Mensagem de saída */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Mensagem de saída</h2>
            
            <div className="border-l-4 border-purple-500 pl-6 space-y-6">
              <h3 className="text-white font-medium">
                Você pode configurar um canal para notificar quando um membro sair do servidor
              </h3>

              {/* Ativar mensagem de saída */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">Ativar mensagem de saída</h4>
                    <p className="text-gray-400 text-sm">
                      Permitir que seja enviado notificações quando um membro sair do servidor
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={ativarMensagemSaida}
                    onChange={setAtivarMensagemSaida}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-xs">
                    <Dropdown
                      value={canalSaida}
                      onChange={setCanalSaida}
                      options={canaisOptions}
                    />
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Testar mensagem
                  </button>
                </div>
              </div>

              {/* Deletar a mensagem após alguns segundos */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h4 className="text-white font-medium mb-2">Deletar a mensagem após alguns segundos</h4>
                <p className="text-gray-400 text-sm mb-4">(DEIXE 0 PARA NUNCA DELETAR)</p>
                
                <input
                  type="text"
                  value={tempoDelecao}
                  onChange={(e) => setTempoDelecao(e.target.value)}
                  className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Variáveis de texto */}
              <div>
                <h4 className="text-white font-medium mb-4">Variáveis de texto:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-purple-400">{'{serverName}'}</span>
                    <span className="text-gray-400"> - Exibe o nome do servidor.</span>
                  </div>
                  <div>
                    <span className="text-purple-400">{'{userTag}'}</span>
                    <span className="text-gray-400"> - Exibe o Nome e Tag do usuário.</span>
                  </div>
                </div>
              </div>

              {/* Mensagem de texto */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
                  <h5 className="text-white font-medium text-lg">Mensagem de texto</h5>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Digite o conteúdo da mensagem!</p>
                  <textarea
                    value={mensagemTexto}
                    onChange={(e) => setMensagemTexto(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[120px]"
                    placeholder="Digite o conteúdo da mensagem!"
                  />
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <h6 className="text-gray-300 font-medium mb-3">Embed</h6>
                  <div className="h-32 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Área do Embed</span>
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