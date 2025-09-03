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
}

function Dropdown({ value, onChange, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-between"
      >
        <span>{selectedOption?.label || 'Selecionar'}</span>
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
        enabled ? 'bg-blue-600' : 'bg-gray-600'
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

export default function LogsEventosContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [configs, setConfigs] = useState({
    financeiro: 'Desativado',
    entradaBot: '#log-proteção',
    mensagemEditada: '#log-msg',
    mensagemDeletada: '#log-msg',
    comandos: 'Desativado',
    canaisVoz: '#log-call',
    entradaMembro: 'Desativado',
    saidaMembro: 'Desativado',
    cargoAdicionado: '#log-cargo',
    cargoRemovido: '#log-cargo',
    cargoCriado: '#log-cargo',
    cargoAtualizado: '#log-cargo',
    cargoDeletado: '#log-cargo',
    canalCriado: 'Desativado',
    canalAtualizado: 'Desativado',
    canalDeletado: '#log-proteção',
  });

  const dropdownOptions: DropdownOption[] = [
    { value: 'Desativado', label: 'Desativado' },
    { value: '#log-proteção', label: '#log-proteção' },
    { value: '#log-msg', label: '#log-msg' },
    { value: '#log-call', label: '#log-call' },
    { value: '#log-cargo', label: '#log-cargo' },
  ];

  const updateConfig = (key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-hidden">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Logs de Eventos</h1>
            <p className="text-gray-400 text-sm">Mantenha seu servidor seguro com logs.</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Eventos Gerais */}
          <section className="border-l-4 border-blue-500 pl-4">
            <h2 className="text-lg font-semibold text-white mb-4">Eventos Gerais</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  FINANCEIRO
                </label>
                <Dropdown
                  value={configs.financeiro}
                  onChange={(value) => updateConfig('financeiro', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  ENTRADA DE BOT
                </label>
                <Dropdown
                  value={configs.entradaBot}
                  onChange={(value) => updateConfig('entradaBot', value)}
                  options={dropdownOptions}
                />
              </div>
            </div>
          </section>

          {/* Eventos de Mensagem */}
          <section className="border-l-4 border-blue-500 pl-4">
            <h2 className="text-lg font-semibold text-white mb-4">Eventos de Mensagem</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  MENSAGEM EDITADA
                </label>
                <Dropdown
                  value={configs.mensagemEditada}
                  onChange={(value) => updateConfig('mensagemEditada', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  MENSAGEM DELETADA
                </label>
                <Dropdown
                  value={configs.mensagemDeletada}
                  onChange={(value) => updateConfig('mensagemDeletada', value)}
                  options={dropdownOptions}
                />
              </div>
            </div>
          </section>

          {/* Eventos de Membro */}
          <section className="border-l-4 border-blue-500 pl-4">
            <h2 className="text-lg font-semibold text-white mb-4">Eventos de Membro</h2>
            <div className="grid grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  COMANDOS
                </label>
                <Dropdown
                  value={configs.comandos}
                  onChange={(value) => updateConfig('comandos', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAIS DE VOZ
                </label>
                <Dropdown
                  value={configs.canaisVoz}
                  onChange={(value) => updateConfig('canaisVoz', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  ENTRADA DE MEMBRO
                </label>
                <Dropdown
                  value={configs.entradaMembro}
                  onChange={(value) => updateConfig('entradaMembro', value)}
                  options={dropdownOptions}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  SAÍDA DE MEMBRO
                </label>
                <Dropdown
                  value={configs.saidaMembro}
                  onChange={(value) => updateConfig('saidaMembro', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CARGO DE MEMBRO ADICIONADO
                </label>
                <Dropdown
                  value={configs.cargoAdicionado}
                  onChange={(value) => updateConfig('cargoAdicionado', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CARGO REMOVIDO DE MEMBRO
                </label>
                <Dropdown
                  value={configs.cargoRemovido}
                  onChange={(value) => updateConfig('cargoRemovido', value)}
                  options={dropdownOptions}
                />
              </div>
            </div>
          </section>

          {/* Eventos de Cargo */}
          <section className="border-l-4 border-blue-500 pl-4">
            <h2 className="text-lg font-semibold text-white mb-4">Eventos de Cargo</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CARGO CRIADO
                </label>
                <Dropdown
                  value={configs.cargoCriado}
                  onChange={(value) => updateConfig('cargoCriado', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CARGO ATUALIZADO
                </label>
                <Dropdown
                  value={configs.cargoAtualizado}
                  onChange={(value) => updateConfig('cargoAtualizado', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CARGO DELETADO
                </label>
                <Dropdown
                  value={configs.cargoDeletado}
                  onChange={(value) => updateConfig('cargoDeletado', value)}
                  options={dropdownOptions}
                />
              </div>
            </div>
          </section>

          {/* Eventos de Canais */}
          <section className="border-l-4 border-blue-500 pl-4">
            <h2 className="text-lg font-semibold text-white mb-4">Eventos de Canais</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAL CRIADO
                </label>
                <Dropdown
                  value={configs.canalCriado}
                  onChange={(value) => updateConfig('canalCriado', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAL ATUALIZADO
                </label>
                <Dropdown
                  value={configs.canalAtualizado}
                  onChange={(value) => updateConfig('canalAtualizado', value)}
                  options={dropdownOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAL DELETADO
                </label>
                <Dropdown
                  value={configs.canalDeletado}
                  onChange={(value) => updateConfig('canalDeletado', value)}
                  options={dropdownOptions}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}