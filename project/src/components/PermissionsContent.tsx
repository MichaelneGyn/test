import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';

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

export default function PermissionsContent() {
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedItem, setSelectedItem] = useState('40sy');
  const [permissions, setPermissions] = useState({
    // GERAL
    posse: true,
    visualizarFinancas: true,
    mudarAparencia: true,
    gerenciarBot: true,
    gerenciarPermissoes: true,
    
    // PLUGINS
    gerenciarProtecaoUrl: true,
    gerenciarProtecaoServidor: true,
    gerenciarAutorole: true,
    gerenciarReacoesAutomaticas: true,
    gerenciarLogsEventos: true,
    gerenciarBemVindoAdeus: true,
    gerenciarModeracao: true,
    gerenciarContadores: true,
    gerenciarMensagens: true,
    gerenciarUtilitarios: true,
    gerenciarPrimeiraDama: true,
    gerenciarTempoCall: true,
    gerenciarMovChat: true,
    gerenciarRegistro: true,
    gerenciarInstagram: true,
    gerenciarInfluencers: true,
    gerenciarTellonym: true,
    gerenciarTickets: true,
    gerenciarVips: true
  });

  const roles = [
    { id: '40sy', name: '40sy', avatar: '👤', color: 'bg-purple-600' },
    { id: 'enganodobeijo', name: 'enganodobeijo', avatar: '🐕', color: 'bg-orange-600' },
    { id: 'mtcarinhosa', name: 'mtcarinhosa', avatar: '👤', color: 'bg-gray-600' },
    { id: 'douglinhasxx', name: 'douglinhasxx', avatar: '👤', color: 'bg-gray-600' }
  ];

  const members = [
    { id: '40sy', name: '40sy', avatar: '👤' },
    { id: 'enganodobeijo', name: 'enganodobeijo', avatar: '🐕' },
    { id: 'mtcarinhosa', name: 'mtcarinhosa', avatar: '👤' },
    { id: 'douglinhasxx', name: 'douglinhasxx', avatar: '👤' }
  ];

  const updatePermission = (key: string, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const currentItems = activeTab === 'roles' ? roles : members;
  const listTitle = activeTab === 'roles' ? 'Lista de cargos' : 'Lista de membros';

  // Renderizar apenas a lista (para aba Cargos)
  const renderOnlyList = () => (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Permissões</h1>
          <p className="text-gray-400">Configure as permissões de acesso ao sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Cargos
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'members'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Membros
          </button>
        </div>

        {/* Lista apenas */}
        <div className="max-w-md">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-medium">{listTitle}</h3>
              <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-gray-300" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {currentItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    selectedItem === item.id
                      ? (activeTab === 'roles' && item.id === '40sy' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white')
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    activeTab === 'roles' && 'color' in item 
                      ? (item as any).color 
                      : 'bg-gray-600'
                  }`}>
                    {item.avatar}
                  </div>
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar com painel de permissões (para aba Membros)
  const renderWithPermissions = () => (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Permissões</h1>
          <p className="text-gray-400">Configure as permissões de acesso ao sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Cargos
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'members'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Membros
          </button>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Left Panel - Items List */}
          <div className="w-80">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-medium">{listTitle}</h3>
                <button className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-gray-300" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {currentItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      selectedItem === item.id
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      activeTab === 'roles' && 'color' in item 
                        ? (item as any).color 
                        : 'bg-gray-600'
                    }`}>
                      {item.avatar}
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Permissions */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-white font-medium mb-1">
                  Você está editando as permissões de {selectedItem}
                </h3>
              </div>

              <div className="space-y-8">
                {/* GERAL Section */}
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    GERAL
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-white font-medium mb-1">Posse</h5>
                        <p className="text-gray-400 text-sm">
                          {activeTab === 'roles' ? 'Cargos' : 'Membros'} com essa permissão têm acesso a todas as funcionalidades do site.
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={permissions.posse}
                        onChange={(value) => updatePermission('posse', value)}
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-white font-medium mb-1">Visualizar Finanças</h5>
                        <p className="text-gray-400 text-sm">
                          Permite que os {activeTab === 'roles' ? 'cargos' : 'membros'} visualizem as informações referente a inscrição premium do servidor.
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={permissions.visualizarFinancas}
                        onChange={(value) => updatePermission('visualizarFinancas', value)}
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-white font-medium mb-1">Mudar Aparência</h5>
                        <p className="text-gray-400 text-sm">
                          Permite que os {activeTab === 'roles' ? 'cargos' : 'membros'} mudem a aparência do bot, como nome e avatar.
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={permissions.mudarAparencia}
                        onChange={(value) => updatePermission('mudarAparencia', value)}
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-white font-medium mb-1">Gerenciar Bot</h5>
                        <p className="text-gray-400 text-sm">
                          Permite que os {activeTab === 'roles' ? 'cargos' : 'membros'} mudem as informações iniciais do bot.
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={permissions.gerenciarBot}
                        onChange={(value) => updatePermission('gerenciarBot', value)}
                      />
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-white font-medium mb-1">Gerenciar Permissões</h5>
                        <p className="text-gray-400 text-sm">
                          Permite que os {activeTab === 'roles' ? 'cargos' : 'membros'} mudem as permissões de outros membros ou cargos no site ou bot.
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={permissions.gerenciarPermissoes}
                        onChange={(value) => updatePermission('gerenciarPermissoes', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* PLUGINS Section */}
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    PLUGINS
                  </h4>
                  <div className="space-y-4">
                    {[
                      { key: 'gerenciarProtecaoUrl', title: 'Gerenciar Proteção de Url', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de proteção de url do servidor.` },
                      { key: 'gerenciarProtecaoServidor', title: 'Gerenciar Proteção de Servidor', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de anti raid do servidor.` },
                      { key: 'gerenciarAutorole', title: 'Gerenciar Autorole', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem cargos atribuídos a novos membros.` },
                      { key: 'gerenciarReacoesAutomaticas', title: 'Gerenciar Reações Automáticas', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de reação automática.` },
                      { key: 'gerenciarLogsEventos', title: 'Gerenciar Logs de Eventos', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de logs de eventos do servidor.` },
                      { key: 'gerenciarBemVindoAdeus', title: 'Gerenciar Bem vindo & Adeus', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de mensagens de entrada e saída do servidor.` },
                      { key: 'gerenciarModeracao', title: 'Gerenciar Moderação', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de moderação dentro do servidor.` },
                      { key: 'gerenciarContadores', title: 'Gerenciar Contadores', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de contadores dentro do servidor.` },
                      { key: 'gerenciarMensagens', title: 'Gerenciar Mensagens', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de mensagens dentro do servidor.` },
                      { key: 'gerenciarUtilitarios', title: 'Gerenciar Utilitários', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de comandos úteis dentro do servidor.` },
                      { key: 'gerenciarPrimeiraDama', title: 'Gerenciar Primeira Dama', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem o cargo de primeira dama, vejam as todas damas do servidor e alterem o limite de damas para cada cargo.` },
                      { key: 'gerenciarTempoCall', title: 'Gerenciar Tempo em Call', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de tempo em call.` },
                      { key: 'gerenciarMovChat', title: 'Gerenciar Mov. Chat', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de Mov. Chat.` },
                      { key: 'gerenciarRegistro', title: 'Gerenciar Registro', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de registro do servidor.` },
                      { key: 'gerenciarInstagram', title: 'Gerenciar Instagram', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações do instagram dentro do servidor.` },
                      { key: 'gerenciarInfluencers', title: 'Gerenciar Influencers', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de influencers dentro do servidor.` },
                      { key: 'gerenciarTellonym', title: 'Gerenciar Tellonym', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de tellonym do servidor.` },
                      { key: 'gerenciarTickets', title: 'Gerenciar Tickets', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de tickets do servidor.` },
                      { key: 'gerenciarVips', title: 'Gerenciar Vips', desc: `Permite que os ${activeTab === 'roles' ? 'cargos' : 'membros'} mudem as configurações de vips do servidor.` }
                    ].map((permission) => (
                      <div key={permission.key} className="flex items-start justify-between">
                        <div>
                          <h5 className="text-white font-medium mb-1">{permission.title}</h5>
                          <p className="text-gray-400 text-sm">{permission.desc}</p>
                        </div>
                        <ToggleSwitch
                          enabled={permissions[permission.key as keyof typeof permissions] as boolean}
                          onChange={(value) => updatePermission(permission.key, value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Deletar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Lógica para decidir qual layout mostrar
  if (activeTab === 'roles') {
    return renderOnlyList(); // Cargos: só a lista
  } else {
    return renderWithPermissions(); // Membros: lista + painel de permissões
  }
}