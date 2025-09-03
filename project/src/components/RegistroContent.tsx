import React, { useState } from 'react';
import { Search, X, Image, Camera, Link as LinkIcon } from 'lucide-react';

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

export default function RegistroContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<{name: string, description: string} | null>(null);

  // Estados para Configuração
  const [cargoNovato, setCargoNovato] = useState('Desativado');
  const [cargoRegistro, setCargoRegistro] = useState('@acess');
  const [canalLogs, setCanalLogs] = useState('#log-verificacao');
  const [tipoRegistro, setTipoRegistro] = useState('automatico');
  const [canalRegistro, setCanalRegistro] = useState('# - folk');
  const [mensagemTexto, setMensagemTexto] = useState('');

  // Estados para o embed
  const [embedData, setEmbedData] = useState({
    cor: '#8b5cf6',
    autorNome: 'Nome',
    autorLink: 'Link',
    titulo: 'Escreva um título...',
    tituloLink: 'Link',
    descricao: '',
    rodape: 'Digite um rodapé...'
  });

  // Estados para Comandos
  const [commands] = useState([
    { name: '/resetregisters', description: 'Utilize para resetar os dados de registro de todos os membros.', enabled: true }
  ]);

  // Estados para Ranking
  const [searchMember, setSearchMember] = useState('');

  const cargoOptions: DropdownOption[] = [
    { value: 'Desativado', label: 'Desativado' },
    { value: '@novato', label: '@novato' },
    { value: '@iniciante', label: '@iniciante' },
  ];

  const cargoRegistroOptions: DropdownOption[] = [
    { value: '@acess', label: '@acess' },
    { value: '@membro', label: '@membro' },
    { value: '@verificado', label: '@verificado' },
  ];

  const canalLogsOptions: DropdownOption[] = [
    { value: '#log-verificacao', label: '#log-verificacao' },
    { value: '#log-geral', label: '#log-geral' },
    { value: '#logs', label: '#logs' },
  ];

  const canalRegistroOptions: DropdownOption[] = [
    { value: '# - folk', label: '# - folk' },
    { value: '#registro', label: '#registro' },
    { value: '#geral', label: '#geral' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'comandos', label: 'Comandos' },
    { id: 'ranking', label: 'Ranking' }
  ];

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCommand = (command: {name: string, description: string}) => {
    setSelectedCommand(command);
    setModalOpen(true);
  };

  const updateEmbedData = (field: string, value: string) => {
    setEmbedData(prev => ({ ...prev, [field]: value }));
  };

  const renderConfiguracaoTab = () => (
    <div className="space-y-8">
      {/* Configure os cargos de registro */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Configure os cargos de registro</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CARGO DE NOVATO
            </label>
            <Dropdown
              value={cargoNovato}
              onChange={setCargoNovato}
              options={cargoOptions}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              CARGO DE REGISTRO
            </label>
            <Dropdown
              value={cargoRegistro}
              onChange={setCargoRegistro}
              options={cargoRegistroOptions}
            />
          </div>
        </div>
      </div>

      {/* Selecione um canal de logs para registros */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Selecione um canal de logs para registros</h3>
        
        <div className="max-w-xs">
          <Dropdown
            value={canalLogs}
            onChange={setCanalLogs}
            options={canalLogsOptions}
          />
        </div>
      </div>

      {/* Configurações de perguntas */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Configurações de perguntas</h2>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400 mb-4">Nenhuma pergunta configurada.</p>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Criar pergunta
          </button>
        </div>
      </div>

      {/* Configurações de registro */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Configurações de registro</h2>
        
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-6">Selecione o tipo de registro</h3>
          
          <div className="space-y-4">
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                tipoRegistro === 'automatico' 
                  ? 'bg-purple-900/30 border-purple-500' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setTipoRegistro('automatico')}
            >
              <h4 className="text-white font-medium mb-2">Registro automático</h4>
              <p className="text-gray-400 text-sm">
                Os membros poderão se registrar automaticamente pelo sistema.
              </p>
            </div>

            <div 
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                tipoRegistro === 'manual' 
                  ? 'bg-purple-900/30 border-purple-500' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setTipoRegistro('manual')}
            >
              <h4 className="text-white font-medium mb-2">Registro manual</h4>
              <p className="text-gray-400 text-sm">
                Os membros poderão ser registrados apenas por outros membros com permissão.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Canal de Registro */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Canal de Registro</h3>
        
        <div className="flex items-center space-x-4">
          <div className="max-w-xs">
            <Dropdown
              value={canalRegistro}
              onChange={setCanalRegistro}
              options={canalRegistroOptions}
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Enviar mensagem
          </button>
        </div>
      </div>

      {/* Mensagem de texto */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Mensagem de texto</h3>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <textarea
            value={mensagemTexto}
            onChange={(e) => setMensagemTexto(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Digite o conteúdo da mensagem!"
          />
        </div>
      </div>

      {/* Embed */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-6">Embed</h3>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {/* Preview Header */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6 text-center">
            <h4 className="text-white font-medium">Preview</h4>
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">Cor</label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-600"
                style={{ backgroundColor: embedData.cor }}
              ></div>
              <input
                type="color"
                value={embedData.cor}
                onChange={(e) => updateEmbedData('cor', e.target.value)}
                className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Autor Section */}
          <div className="mb-6">
            <h4 className="text-white font-medium mb-4">Autor</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <button className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <Camera className="w-4 h-4 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={embedData.autorNome}
                  onChange={(e) => updateEmbedData('autorNome', e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome"
                />
              </div>
              <div className="w-16 h-16 bg-gray-700 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
                <Image className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={embedData.autorLink}
                onChange={(e) => updateEmbedData('autorLink', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Link"
              />
            </div>
          </div>

          {/* Título Section */}
          <div className="mb-6">
            <h4 className="text-white font-medium mb-4">Título</h4>
            <textarea
              value={embedData.titulo}
              onChange={(e) => updateEmbedData('titulo', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Escreva um título..."
            />
            <div className="mt-2">
              <input
                type="text"
                value={embedData.tituloLink}
                onChange={(e) => updateEmbedData('tituloLink', e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Link"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <h4 className="text-white font-medium mb-4">Descrição</h4>
            <textarea
              value={embedData.descricao}
              onChange={(e) => updateEmbedData('descricao', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Digite a descrição..."
            />
          </div>

          {/* Adicionar campo */}
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors mb-6">
            Adicionar campo
          </button>

          {/* Imagem */}
          <div className="mb-6">
            <div className="w-full h-32 bg-gray-700 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-500" />
            </div>
          </div>

          {/* Rodapé */}
          <div className="flex items-center space-x-3">
            <Image className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={embedData.rodape}
              onChange={(e) => updateEmbedData('rodape', e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Digite um rodapé..."
            />
            <button className="text-red-400 hover:text-red-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Configure o botão de registro */}
      <div className="border-l-4 border-purple-500 pl-6">
        <h3 className="text-white font-medium mb-4">Configure o botão de registro</h3>
        
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors flex items-center">
            <div className="w-4 h-4 bg-white rounded-full mr-2 flex items-center justify-center">
              <span className="text-blue-600 text-xs">✓</span>
            </div>
            Verifique-se
          </button>
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          </div>
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

  const renderRankingTab = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header com logo FOLK */}
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        <h2 className="text-2xl font-bold text-white">FOLK</h2>
      </div>

      {/* Ranking de Registros */}
      <div className="flex-1 px-6">
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-6">Ranking de Registros</h3>
          
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

          {/* Table Header */}
          <div className="bg-gray-800 rounded-t-lg border border-gray-700 p-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-400 uppercase tracking-wider">
              <div>#</div>
              <div>User</div>
              <div className="text-right">Total</div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-gray-800 rounded-b-lg border-l border-r border-b border-gray-700 p-8 text-center">
            <p className="text-gray-400">Nenhum dado encontrado.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo e descrição */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-white">MDbots</span>
              </div>
              <p className="text-gray-400 mb-4">Automação inteligente para Discord!</p>
              <p className="text-sm text-gray-500">© 2025 MDbots. Todos os direitos reservados.</p>
            </div>

            {/* MDbots Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">MDbots</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Servidor de Suporte
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Planos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Comandos
                  </a>
                </li>
              </ul>
            </div>

            {/* Sobre nós */}
            <div>
              <h3 className="text-white font-semibold mb-4">Sobre nós</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'configuracao':
        return renderConfiguracaoTab();
      case 'comandos':
        return renderComandosTab();
      case 'ranking':
        return renderRankingTab();
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
            <h1 className="text-2xl font-bold text-white mb-2">Registro</h1>
            <p className="text-gray-400">Configure um sistema de registro, onde seus membros poderão receber tags personalizadas</p>
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