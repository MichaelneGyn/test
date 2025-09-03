import React, { useState } from 'react';
import { Search, ChevronDown, X, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Settings } from 'lucide-react';

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

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  command: {
    name: string;
    description: string;
  } | null;
}

function CommandModal({ isOpen, onClose, command }: CommandModalProps) {
  const [deletarMensagem, setDeletarMensagem] = useState(true);

  if (!isOpen || !command) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Tem certeza que deseja continuar?</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              CARGOS PERMITIDOS: 0
            </h3>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Selecione cargos</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              CARGOS BLOQUEADO: 0
            </h3>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Selecione cargos</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              CANAIS PERMITIDOS: 0
            </h3>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Selecione canais</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              CANAIS BLOQUEADO: 0
            </h3>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>Selecione canais</option>
            </select>
          </div>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-white font-medium mb-1">Deletar mensagem</h3>
            <p className="text-gray-400 text-sm">Deletar mensagem do usuário ao executar o comando</p>
          </div>
          <ToggleSwitch
            enabled={deletarMensagem}
            onChange={setDeletarMensagem}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Redefinir
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

interface VipMember {
  id: string;
  name: string;
  userId: string;
  type: string;
  date: string;
  channel: string;
  avatar: string;
}

export default function VipsContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<{name: string, description: string} | null>(null);
  const [isEditingBooster, setIsEditingBooster] = useState(false);
  const [isEditingBoosterMessage, setIsEditingBoosterMessage] = useState(false);
  const [searchMember, setSearchMember] = useState('');

  // Estados para Configuração
  const [cargosBonus, setCargosBonus] = useState(['@🌟']);
  const [esconderCanaisVazios, setEsconderCanaisVazios] = useState(true);
  const [permitirTagsManualmente, setPermitirTagsManualmente] = useState(false);

  // Estados para Vip Booster
  const [vipBoosterEnabled, setVipBoosterEnabled] = useState(true);
  const [limiteAmigos, setLimiteAmigos] = useState('0');
  const [separadorTag, setSeparadorTag] = useState('Desativado');
  const [categoriaCall, setCategoriaCall] = useState('CATEGORIA DE CALL PERSONALIZADA');
  const [permitirCriarTag, setPermitirCriarTag] = useState(true);
  const [permitirColocarEmoji, setPermitirColocarEmoji] = useState(true);
  const [permitirCriarCall, setPermitirCriarCall] = useState(true);

  // Estados para Mensagem Booster
  const [canalLogBoost, setCanalLogBoost] = useState('CANAL DE LOG');
  const [mensagemBoost, setMensagemBoost] = useState('Digite o conteúdo da mensagem!');
  const [canalLogRemoveBoost, setCanalLogRemoveBoost] = useState('CANAL DE LOG');
  const [mensagemRemoveBoost, setMensagemRemoveBoost] = useState('Digite o conteúdo da mensagem!');

  // Estados para Vip Família
  const [vipFamiliaEnabled, setVipFamiliaEnabled] = useState(true);

  // Estados para Lista de Vips
  const [vipMembers] = useState<VipMember[]>([
    {
      id: '1',
      name: 'brisadinha',
      userId: '274655536784609929',
      type: 'Booster',
      date: 'Sábado 28/07/2025',
      channel: 'Não criado',
      avatar: '👤'
    }
  ]);

  // Estados para Comandos
  const [commands] = useState([
    { name: '/setvip', description: 'Utilize para setar vip em algum membro.', enabled: true }
  ]);

  const cargoOptions: DropdownOption[] = [
    { value: 'Selecione cargos', label: 'Selecione cargos' },
    { value: '@vip', label: '@vip' },
    { value: '@premium', label: '@premium' },
    { value: '@booster', label: '@booster' },
  ];

  const separadorOptions: DropdownOption[] = [
    { value: 'Desativado', label: 'Desativado' },
    { value: '|', label: '|' },
    { value: '-', label: '-' },
    { value: '•', label: '•' },
  ];

  const categoriaOptions: DropdownOption[] = [
    { value: 'CATEGORIA DE CALL PERSONALIZADA', label: 'CATEGORIA DE CALL PERSONALIZADA' },
    { value: 'VIP CALLS', label: 'VIP CALLS' },
    { value: 'CANAIS PRIVADOS', label: 'CANAIS PRIVADOS' },
  ];

  const canalLogOptions: DropdownOption[] = [
    { value: 'CANAL DE LOG', label: 'CANAL DE LOG' },
    { value: '#log-boost', label: '#log-boost' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#logs', label: '#logs' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'lista', label: 'Lista de Vips' },
    { id: 'comandos', label: 'Comandos' }
  ];

  const removerCargoBonus = (index: number) => {
    setCargosBonus(prev => prev.filter((_, i) => i !== index));
  };

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = vipMembers.filter(member =>
    member.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  const handleEditCommand = (command: {name: string, description: string}) => {
    setSelectedCommand(command);
    setModalOpen(true);
  };

  const renderConfiguracaoTab = () => {
    if (isEditingBoosterMessage) {
      return (
        <div className="space-y-8">
          {/* Header da edição */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsEditingBoosterMessage(false)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
          </div>

          {/* Configuração de mensagens para booster */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Configuração de mensagens para booster</h2>
            
            <div className="space-y-8">
              {/* Mensagem ao dar boost */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-6">Mensagem ao dar boost</h3>
                
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    CANAL DE LOG
                  </label>
                  <div className="max-w-xs">
                    <Dropdown
                      value={canalLogBoost}
                      onChange={setCanalLogBoost}
                      options={canalLogOptions}
                    />
                  </div>
                </div>

                {/* Discord Message Preview */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">K</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">KALLY</span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">BOT</span>
                      </div>
                      <span className="text-gray-400 text-xs">Hoje às 11:19</span>
                    </div>
                  </div>
                  
                  <textarea
                    value={mensagemBoost}
                    onChange={(e) => setMensagemBoost(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Digite o conteúdo da mensagem!"
                  />
                </div>

                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mb-6">
                  Adicionar embed
                </button>

                {/* Variáveis de texto */}
                <div>
                  <h4 className="text-white font-medium mb-4">Variáveis de texto:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-400">{'{userId}'}</span>
                      <span className="text-gray-400"> - ID do usuário.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{userMention}'}</span>
                      <span className="text-gray-400"> - Menciona o usuário.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{userName}'}</span>
                      <span className="text-gray-400"> - Nome do usuário.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{serverName}'}</span>
                      <span className="text-gray-400"> - Nome do servidor.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{roleId}'}</span>
                      <span className="text-gray-400"> - ID do cargo.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{roleMention}'}</span>
                      <span className="text-gray-400"> - Menciona o cargo.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{roleName}'}</span>
                      <span className="text-gray-400"> - Nome do cargo.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagem ao remover boost */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-6">Mensagem ao remover boost</h3>
                
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    CANAL DE LOG
                  </label>
                  <div className="max-w-xs">
                    <Dropdown
                      value={canalLogRemoveBoost}
                      onChange={setCanalLogRemoveBoost}
                      options={canalLogOptions}
                    />
                  </div>
                </div>

                {/* Discord Message Preview */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">K</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">KALLY</span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">BOT</span>
                      </div>
                      <span className="text-gray-400 text-xs">Hoje às 11:19</span>
                    </div>
                  </div>
                  
                  <textarea
                    value={mensagemRemoveBoost}
                    onChange={(e) => setMensagemRemoveBoost(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Digite o conteúdo da mensagem!"
                  />
                </div>

                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mb-6">
                  Adicionar embed
                </button>

                {/* Variáveis de texto */}
                <div>
                  <h4 className="text-white font-medium mb-4">Variáveis de texto:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-400">{'{userId}'}</span>
                      <span className="text-gray-400"> - ID do usuário.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{userMention}'}</span>
                      <span className="text-gray-400"> - Menciona o usuário.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{userName}'}</span>
                      <span className="text-gray-400"> - Nome do usuário.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{serverName}'}</span>
                      <span className="text-gray-400"> - Nome do servidor.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{roleId}'}</span>
                      <span className="text-gray-400"> - ID do cargo.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{roleMention}'}</span>
                      <span className="text-gray-400"> - Menciona o cargo.</span>
                    </div>
                    <div>
                      <span className="text-blue-400">{'{roleName}'}</span>
                      <span className="text-gray-400"> - Nome do cargo.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isEditingBooster) {
      return (
        <div className="space-y-8">
          {/* Header da edição */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsEditingBooster(false)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
          </div>

          {/* Configuração vip booster */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Configuração vip booster</h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    LIMITE DE AMIGOS (0 PARA SEM LIMITE) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={limiteAmigos}
                    onChange={(e) => setLimiteAmigos(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    SEPARADOR DE TAG
                  </label>
                  <Dropdown
                    value={separadorTag}
                    onChange={setSeparadorTag}
                    options={separadorOptions}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CATEGORIA DE CALL PERSONALIZADA
                </label>
                <Dropdown
                  value={categoriaCall}
                  onChange={setCategoriaCall}
                  options={categoriaOptions}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">Permitir criar tag</h3>
                    <p className="text-gray-400 text-sm">Permite que membros possam ter uma tag personalizada.</p>
                  </div>
                  <ToggleSwitch
                    enabled={permitirCriarTag}
                    onChange={setPermitirCriarTag}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">Permitir colocar emoji</h3>
                    <p className="text-gray-400 text-sm">Permite que membros possam ter emoji no cargo.</p>
                  </div>
                  <ToggleSwitch
                    enabled={permitirColocarEmoji}
                    onChange={setPermitirColocarEmoji}
                  />
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">Permitir criar call</h3>
                    <p className="text-gray-400 text-sm">Permite que membros possam ter canal de voz privado.</p>
                  </div>
                  <ToggleSwitch
                    enabled={permitirCriarCall}
                    onChange={setPermitirCriarCall}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Cargos bônus a receber ao receber um vip */}
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-4">Cargos bônus a receber ao receber um vip</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                CARGOS: {cargosBonus.length}
              </span>
              <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                LIMPAR
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {cargosBonus.map((cargo, index) => (
                <Tag key={index} onRemove={() => removerCargoBonus(index)}>
                  {cargo}
                </Tag>
              ))}
            </div>
            
            <div className="max-w-xs">
              <Dropdown
                value=""
                onChange={() => {}}
                options={cargoOptions}
                placeholder="Selecione cargos"
              />
            </div>
          </div>
        </div>

        {/* Esconder canais vazios */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Esconder canais vazios</h2>
            <p className="text-gray-400">Esconder canais personalizados quando não houver membros</p>
          </div>
          <ToggleSwitch
            enabled={esconderCanaisVazios}
            onChange={setEsconderCanaisVazios}
          />
        </div>

        {/* Permitir adicionar tags manualmente */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Permitir adicionar tags manualmente</h2>
            <p className="text-gray-400">Permita que membros possam adicionar tags personalizadas sem o uso do comando</p>
          </div>
          <ToggleSwitch
            enabled={permitirTagsManualmente}
            onChange={setPermitirTagsManualmente}
          />
        </div>

        {/* Vips personalizados */}
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-6">Vips personalizados</h3>
          
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
            Criar Vip
          </button>
        </div>

        {/* Vip para Booster */}
        <div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Vip para Booster</h2>
              <p className="text-gray-400">Ative o vip exclusivo para membros que impulsionam seu servidor</p>
            </div>
            <ToggleSwitch
              enabled={vipBoosterEnabled}
              onChange={setVipBoosterEnabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => setIsEditingBooster(true)}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-left hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Editar vip booster</h3>
                  <p className="text-gray-400 text-sm">Configure a forma que o vip para booster irá funcionar</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </button>

            <button
              onClick={() => setIsEditingBoosterMessage(true)}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-left hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Editar mensagem booster</h3>
                  <p className="text-gray-400 text-sm">Configure a mensagem quando um membro impulsionar ou remover impulso do servidor</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </button>
          </div>
        </div>

        {/* Vip Família */}
        <div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-white">Vip Família</h2>
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                  BETA
                </span>
              </div>
            </div>
            <ToggleSwitch
              enabled={vipFamiliaEnabled}
              onChange={setVipFamiliaEnabled}
            />
          </div>

          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
            Criar Família
          </button>
        </div>
      </div>
    );
  };

  const renderListaTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Lista de vips</h3>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar membro..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{member.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-gray-400 text-sm">{member.userId} ({member.type})</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">{member.date}</p>
                    <p className="text-gray-400 text-sm">Canal: {member.channel}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Dropdown
                      value="Ações"
                      onChange={() => {}}
                      options={[
                        { value: 'editar', label: 'Editar' },
                        { value: 'remover', label: 'Remover' },
                        { value: 'renovar', label: 'Renovar' }
                      ]}
                    />
                    <Dropdown
                      value="Tempo"
                      onChange={() => {}}
                      options={[
                        { value: '7d', label: '7 dias' },
                        { value: '30d', label: '30 dias' },
                        { value: 'permanente', label: 'Permanente' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button className="w-8 h-8 bg-gray-800 border border-gray-700 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-purple-600 border border-purple-500 rounded flex items-center justify-center text-white">
            1
          </button>
          <button className="w-8 h-8 bg-gray-800 border border-gray-700 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderComandosTab = () => (
    <div className="space-y-8">
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Lista de comandos</h3>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          {filteredCommands.map((command, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium text-base mb-2">{command.name}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{command.description}</p>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <button 
                  onClick={() => handleEditCommand(command)}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Editar
                </button>
                <ToggleSwitch
                  enabled={command.enabled}
                  onChange={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuracao':
        return renderConfiguracaoTab();
      case 'lista':
        return renderListaTab();
      case 'comandos':
        return renderComandosTab();
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
            <h1 className="text-2xl font-bold text-white mb-2">Vips</h1>
            <p className="text-gray-400">Dê aos membros a vantagem de ter canal de voz e cargo privado e 100% personalizável.</p>
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
        <div className="max-w-6xl">
          {renderTabContent()}
        </div>

        {/* Modal */}
        <CommandModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          command={selectedCommand}
        />
      </div>
    </div>
  );
}