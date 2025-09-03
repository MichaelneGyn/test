import React, { useState } from 'react';
import { X, Plus, Settings, Eye, Trash2, Image } from 'lucide-react';

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

export default function WhitelistContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [sistemaCodigosEnabled, setSistemaCodigosEnabled] = useState(true);
  
  // Estados para canais
  const [canalAprovacao, setCanalAprovacao] = useState('# • fichas');
  const [canalLogs, setCanalLogs] = useState('#log-verificacao');
  
  // Estados para cargos que podem aprovar/negar
  const [cargosAprovacao, setCargosAprovacao] = useState(['gg', '@star', '@exe', '@xp', '@god']);
  
  // Estados para cargos que podem realizar whitelist
  const [cargoWhitelist, setCargoWhitelist] = useState('Permitir todos, exceto:');
  const [cargosExcecao, setCargosExcecao] = useState(['@acess']);
  
  // Estados para cargos de membro verificado
  const [cargosVerificado, setCargosVerificado] = useState(['@acess']);
  
  // Estados para sistema de códigos
  const [cargosCodigo, setCargosCodigo] = useState(['@@']);
  
  // Estados para mensagem
  const [canalMensagem, setCanalMensagem] = useState('# • folk');
  const [mensagemTexto, setMensagemTexto] = useState('');

  const canaisOptions: DropdownOption[] = [
    { value: '# • fichas', label: '# • fichas' },
    { value: '#verificacao', label: '#verificacao' },
    { value: '#whitelist', label: '#whitelist' },
  ];

  const canalLogsOptions: DropdownOption[] = [
    { value: '#log-verificacao', label: '#log-verificacao' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#logs', label: '#logs' },
  ];

  const canalMensagemOptions: DropdownOption[] = [
    { value: '# • folk', label: '# • folk' },
    { value: '#geral', label: '#geral' },
    { value: '#anuncios', label: '#anuncios' },
  ];

  const cargoWhitelistOptions: DropdownOption[] = [
    { value: 'Permitir todos, exceto:', label: 'Permitir todos, exceto:' },
    { value: 'Permitir apenas:', label: 'Permitir apenas:' },
    { value: 'Ninguém', label: 'Ninguém' },
  ];

  const removerCargoAprovacao = (index: number) => {
    setCargosAprovacao(prev => prev.filter((_, i) => i !== index));
  };

  const removerCargoExcecao = (index: number) => {
    setCargosExcecao(prev => prev.filter((_, i) => i !== index));
  };

  const removerCargoVerificado = (index: number) => {
    setCargosVerificado(prev => prev.filter((_, i) => i !== index));
  };

  const removerCargoCodigo = (index: number) => {
    setCargosCodigo(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Whitelist</h1>
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                Update
              </span>
            </div>
            <p className="text-gray-400">Verifique seus novos membros de forma fácil e prática!</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Configure os canais da whitelist */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-6">Configure os canais da whitelist</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Canal de aprovação</label>
                <Dropdown
                  value={canalAprovacao}
                  onChange={setCanalAprovacao}
                  options={canaisOptions}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Canal de logs</label>
                <Dropdown
                  value={canalLogs}
                  onChange={setCanalLogs}
                  options={canalLogsOptions}
                />
              </div>
            </div>
          </div>

          {/* Cargos que poderão aprovar ou negar whitelist */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">
              Cargos que poderão aprovar ou negar whitelist (Deixe vazio para permitir todos membros)
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-4">
                <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-gray-300" />
                </button>
                {cargosAprovacao.map((cargo, index) => (
                  <Tag key={index} onRemove={() => removerCargoAprovacao(index)}>
                    {cargo}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Cargos que poderão realizar a whitelist */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Cargos que poderão realizar a whitelist</h3>
            
            <div className="mb-4">
              <div className="max-w-xs mb-4">
                <Dropdown
                  value={cargoWhitelist}
                  onChange={setCargoWhitelist}
                  options={cargoWhitelistOptions}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-gray-300" />
                </button>
                {cargosExcecao.map((cargo, index) => (
                  <Tag key={index} onRemove={() => removerCargoExcecao(index)}>
                    {cargo}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Configure os cargos de membro verificado */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Configure os cargos de membro verificado</h3>
            
            <div className="flex items-center space-x-2">
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
              {cargosVerificado.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoVerificado(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
          </div>

          {/* Tipo de verificação */}
          <div className="border-l-4 border-purple-500 pl-6">
            <div className="flex items-center space-x-3 mb-6">
              <h3 className="text-white font-medium">Tipo de verificação</h3>
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                BETA
              </span>
            </div>
            
            <div className="space-y-6">
              {/* Verificação por perguntas */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-white font-medium mb-2">Verificação por perguntas</h4>
                <p className="text-gray-400 text-sm">
                  Os membros devem responder algumas perguntas para serem verificado.
                </p>
              </div>

              {/* Verificação por usuário */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h4 className="text-white font-medium mb-2">Verificação por usuário</h4>
                <p className="text-gray-400 text-sm">
                  Os membros devem selecionar um usuário conhecido para ser verificado.
                </p>
              </div>
            </div>
          </div>

          {/* Sistema de códigos */}
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-semibold text-white">Sistema de códigos</h2>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    BETA
                  </span>
                </div>
                <p className="text-gray-400">Permitir que membros utilizem o sistema de aprovação por código</p>
              </div>
              <ToggleSwitch enabled={sistemaCodigosEnabled} onChange={setSistemaCodigosEnabled} />
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-white font-medium mb-4">
                Cargos que poderão criar código (Deixe vazio para permitir todos membros)
              </h3>
              
              <div className="flex items-center space-x-2">
                <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-gray-300" />
                </button>
                {cargosCodigo.map((cargo, index) => (
                  <Tag key={index} onRemove={() => removerCargoCodigo(index)}>
                    {cargo}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Mensagem</h2>
            
            <div className="border-l-4 border-purple-500 pl-6 space-y-6">
              <h3 className="text-white font-medium">Crie mensagens customizadas ao seu gosto!</h3>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Canal da mensagem de verificação</label>
                <div className="flex items-center space-x-4">
                  <div className="max-w-xs">
                    <Dropdown
                      value={canalMensagem}
                      onChange={setCanalMensagem}
                      options={canalMensagemOptions}
                    />
                  </div>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Enviar mensagem
                  </button>
                </div>
              </div>

              {/* Discord Message Preview */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">KALLY</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">BOT</span>
                    </div>
                    <span className="text-gray-400 text-xs">Hoje às 09:08</span>
                  </div>
                </div>
                
                <textarea
                  value={mensagemTexto}
                  onChange={(e) => setMensagemTexto(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Escreva sua mensagem aqui..."
                />
              </div>

              {/* Embed Editor */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 bg-gray-900 rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">F</span>
                      </div>
                      <span className="text-white font-medium">FOLK</span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-white font-medium">Título</span>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                    <div className="w-16 h-16 bg-gray-700 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>

                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors">
                    Adicionar campo
                  </button>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Footer</span>
                </div>
              </div>

              {/* Configure o botão de verificação */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">Configure o botão de verificação</h3>
                
                <div className="flex items-center space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors flex items-center">
                    <span className="w-4 h-4 bg-white rounded-full mr-2"></span>
                    Verificar
                  </button>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
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