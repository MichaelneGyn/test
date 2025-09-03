import React, { useState } from 'react';
import { ChevronDown, X, Image, Plus } from 'lucide-react';

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

export default function TellonymContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [cargosAprovacao, setCargosAprovacao] = useState(['@tell']);
  const [canalPostagemPendente, setCanalPostagemPendente] = useState('Selecione um canal');
  const [canalPostagens, setCanalPostagens] = useState('# - tell');
  const [canalLogsAprovacoes, setCanalLogsAprovacoes] = useState('Selecione um canal');
  const [urlBarrinha, setUrlBarrinha] = useState('https://cdn.discordapp.com/attachments/1389357709857521829/1390161589667725502/ENQUETE.png');
  const [permitirComentarios, setPermitirComentarios] = useState(true);
  const [canalMensagem, setCanalMensagem] = useState('# - link');
  const [mensagemTexto, setMensagemTexto] = useState('');

  // Estados para o embed
  const [embedData, setEmbedData] = useState({
    cor: '#8b5cf6',
    autorNome: 'FOLK',
    autorLink: '',
    titulo: '**TELLONYM FOLK**',
    tituloLink: '',
    descricao: 'Encaminhe sua farpa, fofoca ou declaração anônima.',
    rodape: 'Digite um rodapé...'
  });

  const canaisOptions: DropdownOption[] = [
    { value: 'Selecione um canal', label: 'Selecione um canal' },
    { value: '# - tell', label: '# - tell' },
    { value: '#tellonym', label: '#tellonym' },
    { value: '#anonimo', label: '#anonimo' },
  ];

  const canalMensagemOptions: DropdownOption[] = [
    { value: '# - link', label: '# - link' },
    { value: '#geral', label: '#geral' },
    { value: '#anuncios', label: '#anuncios' },
  ];

  const removerCargoAprovacao = (index: number) => {
    setCargosAprovacao(prev => prev.filter((_, i) => i !== index));
  };

  const updateEmbedData = (field: string, value: string) => {
    setEmbedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Tellonym</h1>
            <p className="text-gray-400">Tellonym é um meio de enviar mensagens anônimas. Ótimo para aumentar o entretenimento em sua comunidade!</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Configure cargos que terão permissão para aprovar/negar postagens */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">
              Configure cargos que terão permissão para aprovar/negar postagens
            </h3>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  CARGOS: {cargosAprovacao.length}
                </span>
                <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                  LIMPAR
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {cargosAprovacao.map((cargo, index) => (
                  <Tag key={index} onRemove={() => removerCargoAprovacao(index)}>
                    {cargo}
                  </Tag>
                ))}
              </div>
              
              <div className="max-w-xs">
                <Dropdown
                  value=""
                  onChange={() => {}}
                  options={[
                    { value: '@moderador', label: '@moderador' },
                    { value: '@admin', label: '@admin' },
                    { value: '@staff', label: '@staff' }
                  ]}
                  placeholder="Selecione cargos"
                />
              </div>
            </div>
          </div>

          {/* Antes de estar visível ao público */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-6">
              Antes de estar visível ao público, é ideal que as postagens sejam analisadas pela moderação do servidor.
            </h3>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAL DE POSTAGEM PENDENTE
                </label>
                <Dropdown
                  value={canalPostagemPendente}
                  onChange={setCanalPostagemPendente}
                  options={canaisOptions}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAL DE POSTAGENS
                </label>
                <Dropdown
                  value={canalPostagens}
                  onChange={setCanalPostagens}
                  options={canaisOptions}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  CANAL DE LOGS DE APROVAÇÕES
                </label>
                <Dropdown
                  value={canalLogsAprovacoes}
                  onChange={setCanalLogsAprovacoes}
                  options={canaisOptions}
                />
              </div>
            </div>

            {/* Barrinha */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                BARRINHA
              </label>
              <input
                type="text"
                value={urlBarrinha}
                onChange={(e) => setUrlBarrinha(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="mt-2 text-xs text-gray-400">
                Sua url deve terminar com: 
                <span className="text-purple-400 mx-1">.png</span>
                <span className="text-purple-400 mx-1">.jpg</span>
                <span className="text-purple-400 mx-1">.jpeg</span>
                <span className="text-purple-400 mx-1">.webp</span>
                <span className="text-purple-400 mx-1">.gif</span>
              </div>
            </div>
          </div>

          {/* Permitir comentários */}
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Permitir comentários</h2>
                <p className="text-gray-400">Permitir que membros possam comentar nas postagens.</p>
              </div>
              <ToggleSwitch
                enabled={permitirComentarios}
                onChange={setPermitirComentarios}
              />
            </div>
          </div>

          {/* Canal onde será postado a mensagem para enviar postagens */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-4">Canal onde será postado a mensagem para enviar postagens</h3>
            
            <div className="flex items-center space-x-4 mb-6">
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

            {/* Mensagem de texto */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-4">Mensagem de texto</h4>
              <textarea
                value={mensagemTexto}
                onChange={(e) => setMensagemTexto(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Digite o conteúdo da mensagem!"
              />
            </div>

            {/* Embed Editor */}
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
                      <X className="w-4 h-4 text-gray-400" />
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
              </div>
            </div>

            {/* Configure o botão de tellonym */}
            <div className="border-l-4 border-purple-500 pl-6 mt-8">
              <h3 className="text-white font-medium mb-4">Configure o botão de tellonym</h3>
              
              <div className="flex items-center space-x-4">
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-medium transition-colors flex items-center">
                  <div className="w-4 h-4 bg-white rounded-full mr-2 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-red-500" />
                  </div>
                  Enviar Tellonym
                </button>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}