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

export default function ProtecaoServidorContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');
  
  // Estados para aba Geral
  const [tempoCriacao, setTempoCriacao] = useState('0');
  const [cargosIgnorados, setCargosIgnorados] = useState(['gg']);
  const [bloquearBots, setBloquearBots] = useState(false);

  // Estados para aba Bans/Kicks
  const [limiteAcaoBans, setLimiteAcaoBans] = useState('3');
  const [tempoMinutosBans, setTempoMinutosBans] = useState('1');
  const [canalLogsBans, setCanalLogsBans] = useState('#log-proteção');
  const [punicaoBans, setPunicaoBans] = useState('Remover todos os cargos');
  const [bloquearBanimentos, setBloquearBanimentos] = useState(true);
  const [bloquearExpulsoes, setBloquearExpulsoes] = useState(true);

  // Estados para aba Castigos
  const [limiteAcaoCastigos, setLimiteAcaoCastigos] = useState('3');
  const [tempoMinutosCastigos, setTempoMinutosCastigos] = useState('1');
  const [canalLogsCastigos, setCanalLogsCastigos] = useState('#log-proteção');
  const [punicaoCastigos, setPunicaoCastigos] = useState('Remover todos os cargos');
  const [bloquearCastigos, setBloquearCastigos] = useState(false);

  // Estados para aba Canais
  const [limiteAcaoCanais, setLimiteAcaoCanais] = useState('3');
  const [tempoMinutosCanais, setTempoMinutosCanais] = useState('1');
  const [canalLogsCanais, setCanalLogsCanais] = useState('#log-proteção');
  const [punicaoCanais, setPunicaoCanais] = useState('Remover todos os cargos');

  // Estados para aba Cargos
  const [limiteAcaoCargos, setLimiteAcaoCargos] = useState('3');
  const [tempoMinutosCargos, setTempoMinutosCargos] = useState('1');
  const [canalLogsCargos, setCanalLogsCargos] = useState('#log-proteção');
  const [punicaoCargos, setPunicaoCargos] = useState('Remover todos os cargos');
  const [cargosBloqueados, setCargosBloqueados] = useState(['@sr6', '@god', '@🤖', '@star', '@exe']);
  
  // Permissões liberadas
  const [permissoes, setPermissoes] = useState({
    administrador: false,
    banir: true,
    expulsar: true,
    gerenciarCargos: true,
    gerenciarCanais: true,
    gerenciarServidor: false
  });

  // Estados para aba Comandos
  const [limiteAcaoComandos, setLimiteAcaoComandos] = useState('3');
  const [tempoMinutosComandos, setTempoMinutosComandos] = useState('1');
  const [canalLogsComandos, setCanalLogsComandos] = useState('#log-proteção');
  const [punicaoComandos, setPunicaoComandos] = useState('Remover todos os cargos');

  const canaisOptions: DropdownOption[] = [
    { value: '#log-proteção', label: '#log-proteção' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#moderação', label: '#moderação' },
  ];

  const punicaoOptions: DropdownOption[] = [
    { value: 'Remover todos os cargos', label: 'Remover todos os cargos' },
    { value: 'Banir do servidor', label: 'Banir do servidor' },
    { value: 'Expulsar do servidor', label: 'Expulsar do servidor' },
    { value: 'Timeout', label: 'Timeout' },
  ];

  const cargoOptions: DropdownOption[] = [
    { value: 'Selecione um cargo', label: 'Selecione um cargo' },
    { value: '@moderador', label: '@moderador' },
    { value: '@admin', label: '@admin' },
    { value: '@vip', label: '@vip' },
  ];

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'bans', label: 'Bans/Kicks' },
    { id: 'castigos', label: 'Castigos' },
    { id: 'canais', label: 'Canais' },
    { id: 'cargos', label: 'Cargos' },
    { id: 'comandos', label: 'Comandos' }
  ];

  const removerCargoIgnorado = (index: number) => {
    setCargosIgnorados(prev => prev.filter((_, i) => i !== index));
  };

  const removerCargoBloqueado = (index: number) => {
    setCargosBloqueados(prev => prev.filter((_, i) => i !== index));
  };

  const updatePermissao = (key: string, value: boolean) => {
    setPermissoes(prev => ({ ...prev, [key]: value }));
  };

  const renderGeralTab = () => (
    <div className="space-y-8">
      {/* Configure a proteção contra fakes */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configure a proteção contra fakes (Deixe em 0 para desativar)
        </h3>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            TEMPO DE CRIAÇÃO DE CONTA (EM DIAS)
          </label>
          <input
            type="text"
            value={tempoCriacao}
            onChange={(e) => setTempoCriacao(e.target.value)}
            className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Ignorar cargos */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Ignorar cargos (A proteção irá ignorar todos os cargos listados abaixo)
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              CARGOS: {cargosIgnorados.length}
            </span>
            <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
              LIMPAR
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {cargosIgnorados.map((cargo, index) => (
              <Tag key={index} onRemove={() => removerCargoIgnorado(index)}>
                {cargo}
              </Tag>
            ))}
          </div>
          
          <div className="max-w-xs">
            <Dropdown
              value=""
              onChange={() => {}}
              options={cargoOptions}
              placeholder="Selecione um cargo"
            />
          </div>
        </div>
      </div>

      {/* Bloquear adicionar bots */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-medium mb-1">Bloquear adicionar bots</h3>
          <p className="text-gray-400 text-sm">
            Impedir que membros adicionem outros bots no servidor
          </p>
        </div>
        <ToggleSwitch
          enabled={bloquearBots}
          onChange={setBloquearBots}
        />
      </div>
    </div>
  );

  const renderBansTab = () => (
    <div className="space-y-8">
      {/* Configure a proteção contra banimentos/expulsões em massa */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configure a proteção contra banimentos/expulsões em massa
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LIMITE DE AÇÃO
            </label>
            <input
              type="text"
              value={limiteAcaoBans}
              onChange={(e) => setLimiteAcaoBans(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              TEMPO (MINUTOS)
            </label>
            <input
              type="text"
              value={tempoMinutosBans}
              onChange={(e) => setTempoMinutosBans(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CANAL DE LOGS
            </label>
            <Dropdown
              value={canalLogsBans}
              onChange={setCanalLogsBans}
              options={canaisOptions}
            />
          </div>
        </div>
      </div>

      {/* Punição a ser aplicada */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Punição a ser aplicada</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={punicaoBans}
            onChange={setPunicaoBans}
            options={punicaoOptions}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">Bloquear banimentos manuais</h3>
            <p className="text-gray-400 text-sm">
              Punir membros que tentarem banir manualmente
            </p>
          </div>
          <ToggleSwitch
            enabled={bloquearBanimentos}
            onChange={setBloquearBanimentos}
          />
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-medium mb-1">Bloquear expulsões manuais</h3>
            <p className="text-gray-400 text-sm">
              Punir membros que tentarem expulsar manualmente
            </p>
          </div>
          <ToggleSwitch
            enabled={bloquearExpulsoes}
            onChange={setBloquearExpulsoes}
          />
        </div>
      </div>
    </div>
  );

  const renderCastigosTab = () => (
    <div className="space-y-8">
      {/* Configure a proteção contra castigos em massa */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configure a proteção contra castigos em massa
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LIMITE DE AÇÃO
            </label>
            <input
              type="text"
              value={limiteAcaoCastigos}
              onChange={(e) => setLimiteAcaoCastigos(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              TEMPO (MINUTOS)
            </label>
            <input
              type="text"
              value={tempoMinutosCastigos}
              onChange={(e) => setTempoMinutosCastigos(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CANAL DE LOGS
            </label>
            <Dropdown
              value={canalLogsCastigos}
              onChange={setCanalLogsCastigos}
              options={canaisOptions}
            />
          </div>
        </div>
      </div>

      {/* Punição a ser aplicada */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Punição a ser aplicada</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={punicaoCastigos}
            onChange={setPunicaoCastigos}
            options={punicaoOptions}
          />
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-medium mb-1">Bloquear castigos manuais</h3>
          <p className="text-gray-400 text-sm">
            Punir membros que tentarem castigar manualmente
          </p>
        </div>
        <ToggleSwitch
          enabled={bloquearCastigos}
          onChange={setBloquearCastigos}
        />
      </div>
    </div>
  );

  const renderCanaisTab = () => (
    <div className="space-y-8">
      {/* Configure a proteção contra exclusão em massa */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configure a proteção contra exclusão em massa
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LIMITE DE AÇÃO
            </label>
            <input
              type="text"
              value={limiteAcaoCanais}
              onChange={(e) => setLimiteAcaoCanais(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              TEMPO (MINUTOS)
            </label>
            <input
              type="text"
              value={tempoMinutosCanais}
              onChange={(e) => setTempoMinutosCanais(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CANAL DE LOGS
            </label>
            <Dropdown
              value={canalLogsCanais}
              onChange={setCanalLogsCanais}
              options={canaisOptions}
            />
          </div>
        </div>
      </div>

      {/* Punição a ser aplicada */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Punição a ser aplicada</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={punicaoCanais}
            onChange={setPunicaoCanais}
            options={punicaoOptions}
          />
        </div>
      </div>
    </div>
  );

  const renderCargosTab = () => (
    <div className="space-y-8">
      {/* Configure a proteção contra exclusão em massa */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configure a proteção contra exclusão em massa
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LIMITE DE AÇÃO
            </label>
            <input
              type="text"
              value={limiteAcaoCargos}
              onChange={(e) => setLimiteAcaoCargos(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              TEMPO (MINUTOS)
            </label>
            <input
              type="text"
              value={tempoMinutosCargos}
              onChange={(e) => setTempoMinutosCargos(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CANAL DE LOGS
            </label>
            <Dropdown
              value={canalLogsCargos}
              onChange={setCanalLogsCargos}
              options={canaisOptions}
            />
          </div>
        </div>
      </div>

      {/* Punição a ser aplicada */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Punição a ser aplicada</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={punicaoCargos}
            onChange={setPunicaoCargos}
            options={punicaoOptions}
          />
        </div>
      </div>

      {/* Cargos bloqueados */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Cargos bloqueados (Os cargos listados abaixo serão bloqueados de adicionar manualmente, mas ainda será possível através de comando)
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              CARGOS: {cargosBloqueados.length}
            </span>
            <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
              LIMPAR
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {cargosBloqueados.map((cargo, index) => (
              <Tag key={index} onRemove={() => removerCargoBloqueado(index)}>
                {cargo}
              </Tag>
            ))}
            <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
              Ver tudo
            </button>
          </div>
          
          <div className="max-w-xs">
            <Dropdown
              value=""
              onChange={() => {}}
              options={cargoOptions}
              placeholder="Selecione um cargo"
            />
          </div>
        </div>
      </div>

      {/* Permissões liberadas */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Permissões liberadas (Permite que estas permissões sejam adicionadas em cargos, ou que membros recebam cargos que tenham alguma dessas permissões)
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Administrador</h4>
                <p className="text-gray-400 text-sm">Permitir permissão de Administrador</p>
              </div>
              <ToggleSwitch
                enabled={permissoes.administrador}
                onChange={(value) => updatePermissao('administrador', value)}
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Expulsar</h4>
                <p className="text-gray-400 text-sm">Permitir permissão de Expulsar</p>
              </div>
              <ToggleSwitch
                enabled={permissoes.expulsar}
                onChange={(value) => updatePermissao('expulsar', value)}
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Gerenciar Canais</h4>
                <p className="text-gray-400 text-sm">Permitir permissão de Gerenciar Canais</p>
              </div>
              <ToggleSwitch
                enabled={permissoes.gerenciarCanais}
                onChange={(value) => updatePermissao('gerenciarCanais', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Banir</h4>
                <p className="text-gray-400 text-sm">Permitir permissão de Banir</p>
              </div>
              <ToggleSwitch
                enabled={permissoes.banir}
                onChange={(value) => updatePermissao('banir', value)}
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Gerenciar Cargos</h4>
                <p className="text-gray-400 text-sm">Permitir permissão de Gerenciar Cargos</p>
              </div>
              <ToggleSwitch
                enabled={permissoes.gerenciarCargos}
                onChange={(value) => updatePermissao('gerenciarCargos', value)}
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Gerenciar Servidor</h4>
                <p className="text-gray-400 text-sm">Permitir permissão de Gerenciar Servidor</p>
              </div>
              <ToggleSwitch
                enabled={permissoes.gerenciarServidor}
                onChange={(value) => updatePermissao('gerenciarServidor', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComandosTab = () => (
    <div className="space-y-8">
      {/* Configure a proteção contra exclusão em massa */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">
          Configure a proteção contra exclusão em massa
        </h3>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              LIMITE DE AÇÃO
            </label>
            <input
              type="text"
              value={limiteAcaoComandos}
              onChange={(e) => setLimiteAcaoComandos(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              TEMPO (MINUTOS)
            </label>
            <input
              type="text"
              value={tempoMinutosComandos}
              onChange={(e) => setTempoMinutosComandos(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CANAL DE LOGS
            </label>
            <Dropdown
              value={canalLogsComandos}
              onChange={setCanalLogsComandos}
              options={canaisOptions}
            />
          </div>
        </div>
      </div>

      {/* Punição a ser aplicada */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Punição a ser aplicada</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={punicaoComandos}
            onChange={setPunicaoComandos}
            options={punicaoOptions}
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return renderGeralTab();
      case 'bans':
        return renderBansTab();
      case 'castigos':
        return renderCastigosTab();
      case 'canais':
        return renderCanaisTab();
      case 'cargos':
        return renderCargosTab();
      case 'comandos':
        return renderComandosTab();
      default:
        return renderGeralTab();
    }
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Proteção de Servidor</h1>
            <p className="text-gray-400">Mantenha seu servidor protegido contra ataques.</p>
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