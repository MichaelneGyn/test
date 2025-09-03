import { useState } from 'react';
import { Search, ChevronDown, X, Image, ArrowLeft, Settings, Eye, Trash2 } from 'lucide-react';

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

interface TicketOption {
  id: string;
  label: string;
  description: string;
}

export default function TicketsContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('configuracao');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<{name: string, description: string} | null>(null);
  const [isEditingPanel, setIsEditingPanel] = useState(false);
  const [activeComponentTab, setActiveComponentTab] = useState('botoes');

  // Estados para painéis
  const [paineis] = useState([
    { id: 'folk', name: 'FOLK' },
    { id: 'be-a-member', name: 'BE A MEMBER' }
  ]);

  // Estados para edição de painel
  const [panelName, setPanelName] = useState('FOLK');
  const [canalTicket, setCanalTicket] = useState('# - support');
  const [mensagemTexto, setMensagemTexto] = useState('');

  // Estados para o embed
  const [embedData, setEmbedData] = useState({
    cor: '#8b5cf6',
    autorNome: 'MD',
    autorLink: '',
    titulo: 'Título',
    tituloLink: '',
    descricao: '',
    rodape: 'Footer'
  });

  // Estados para componentes
  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>([
    { id: 'suporte', label: 'Suporte', description: 'Exibir detalhes' },
    { id: 'denuncia', label: 'Denúncia', description: 'Exibir detalhes' }
  ]);

  // Estados para Comandos
  const [commands] = useState([
    { name: '/ticketsinfo', description: 'Visualize as informações de tickets atendidos.', enabled: true },
    { name: '/resettickets', description: 'Apague a contagem de tickets atendidos de todos os moderadores.', enabled: true }
  ]);

  const canaisOptions: DropdownOption[] = [
    { value: '# - support', label: '# - support' },
    { value: '#tickets', label: '#tickets' },
    { value: '#suporte', label: '#suporte' },
  ];

  const tabs = [
    { id: 'configuracao', label: 'Configuração' },
    { id: 'comandos', label: 'Comandos' },
    { id: 'ranking', label: 'Ranking' }
  ];

  const componentTabs = [
    { id: 'botoes', label: 'Botões' },
    { id: 'menu', label: 'Menu de seleção' }
  ];

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCommand = (command: {name: string, description: string}) => {
    setSelectedCommand(command);
    setModalOpen(true);
  };

  const handleEditPanel = (panelId: string) => {
    const panel = paineis.find(p => p.id === panelId);
    if (panel) {
      setPanelName(panel.name);
      setIsEditingPanel(true);
    }
  };

  const handleSavePanel = () => {
    setIsEditingPanel(false);
  };

  const handleDeletePanel = () => {
    setIsEditingPanel(false);
  };

  const updateEmbedData = (field: string, value: string) => {
    setEmbedData(prev => ({ ...prev, [field]: value }));
  };

  const removeTicketOption = (id: string) => {
    setTicketOptions(prev => prev.filter(option => option.id !== id));
  };

  const addTicketOption = () => {
    const newOption: TicketOption = {
      id: `option-${Date.now()}`,
      label: 'Nova opção',
      description: 'Exibir detalhes'
    };
    setTicketOptions(prev => [...prev, newOption]);
  };

  const renderConfiguracaoTab = () => {
    if (isEditingPanel) {
      return (
        <div className="space-y-8">
          {/* Header da edição */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsEditingPanel(false)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <div className="flex items-center space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Enviar mensagem
              </button>
              <button
                onClick={handleDeletePanel}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Deletar
              </button>
              <button
                onClick={handleSavePanel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Edição de painel para ticket */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-6">Edição de painel para ticket</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Canal do ticket <span className="text-red-400">*</span>
                </label>
                <Dropdown
                  value={canalTicket}
                  onChange={setCanalTicket}
                  options={canaisOptions}
                />
              </div>
            </div>
          </div>

          {/* Mensagem principal */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Mensagem principal</h2>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-white font-medium mb-6">Mensagem fixa para o painel</h3>
              
              {/* Discord Message Preview */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">MD</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">BOT</span>
                    </div>
                    <span className="text-gray-400 text-xs">Hoje às 11:12</span>
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
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center space-x-4 mb-6">
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
                        <Image className="w-4 h-4 text-gray-400" />
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
          </div>

          {/* Componentes */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Componentes</h2>
            
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-white font-medium mb-6">Configure os componentes do ticket</h3>
              
              {/* Component Tabs */}
              <div className="flex space-x-4 mb-6">
                {componentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveComponentTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeComponentTab === tab.id
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Component Content */}
              {activeComponentTab === 'menu' && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <input
                      type="text"
                      placeholder="Selecione uma opção"
                      className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                  </div>

                  <div className="space-y-3">
                    {ticketOptions.map((option) => (
                      <div key={option.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">:</span>
                          <span className="text-white">{option.label}</span>
                          <span className="text-gray-400">{option.description}</span>
                        </div>
                        <button
                          onClick={() => removeTicketOption(option.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Remover opção
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addTicketOption}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Criar opção
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Configure mensagens customizadas para seu servidor */}
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-6">Configure mensagens customizadas para seu servidor</h3>
          
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors ml-4">
              Novo Painel (2/15)
            </button>
          </div>

          <div className="space-y-3">
            {paineis.map((painel) => (
              <button
                key={painel.id}
                onClick={() => handleEditPanel(painel.id)}
                className="w-full bg-gray-800 rounded-lg border border-gray-700 p-4 text-left hover:border-gray-600 transition-colors"
              >
                <span className="text-white">{painel.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

      {/* Ranking de Tickets */}
      <div className="flex-1 px-6">
        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-white font-medium mb-6">Ranking de Tickets</h3>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar membro..."
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
            <h1 className="text-2xl font-bold text-white mb-2">Tickets</h1>
            <p className="text-gray-400">Aumente a capacidade de atendimento aos seus membros com tickets, mantendo ao mesmo tempo os canais públicos limpos.</p>
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