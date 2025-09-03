import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

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

export default function UtilitariosContent() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<{name: string, description: string} | null>(null);

  const [commands] = useState([
    { name: '/clear', description: 'Limpe as mensagens de um canal.', enabled: true },
    { name: '/membersrole', description: 'Veja a lista de membros de um cargo.', enabled: true },
    { name: '/ajuda', description: 'Utilize para visualizar as informações referente aos meus comandos.', enabled: true },
    { name: '/cl', description: 'Limpe as suas mensagens em um canal.', enabled: true }
  ]);

  const filteredCommands = commands.filter(command => 
    command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCommand = (command: {name: string, description: string}) => {
    setSelectedCommand(command);
    setModalOpen(true);
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Utilitários</h1>
            <p className="text-gray-400">Configure comandos gerais.</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Lista de comandos */}
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
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium mb-1">{command.name}</h4>
                    <p className="text-gray-400 text-sm">{command.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleEditCommand(command)}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
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