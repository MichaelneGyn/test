import React, { useState } from 'react';
import { X } from 'lucide-react';

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

export default function ConfiguracoesContent() {
  const [prefixo, setPrefixo] = useState('f!');
  const [nomeBot, setNomeBot] = useState('cl');
  const [deletarMensagem, setDeletarMensagem] = useState(true);
  const [permitirSlash, setPermitirSlash] = useState(true);
  const [canaisSelecionados, setCanaisSelecionados] = useState([
    '# • cmd',
    '# • cmd',
    '1404493313394249478'
  ]);

  const removerCanal = (index: number) => {
    setCanaisSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-gray-400">Configure as principais informações de funcionamento</p>
        </div>

        {/* Configurações de comando */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-6">Configurações de comando</h2>
            
            <div className="space-y-6">
              {/* Configure o prefixo */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">Configure o prefixo para comandos em mensagem</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      PREFIXO
                    </label>
                    <input
                      type="text"
                      value={prefixo}
                      onChange={(e) => setPrefixo(e.target.value)}
                      className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      NOME DO CL
                    </label>
                    <input
                      type="text"
                      value={nomeBot}
                      onChange={(e) => setNomeBot(e.target.value)}
                      className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Deletar mensagem */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Deletar mensagem</h3>
                  <p className="text-gray-400 text-sm">
                    Ao executar um comando, irei deletar a mensagem do usuário
                  </p>
                </div>
                <ToggleSwitch
                  enabled={deletarMensagem}
                  onChange={setDeletarMensagem}
                />
              </div>

              {/* Permitir comandos em Slash */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Permitir comandos em Slash</h3>
                  <p className="text-gray-400 text-sm">
                    Permitir que usuários utilizem comandos com "/"
                  </p>
                </div>
                <ToggleSwitch
                  enabled={permitirSlash}
                  onChange={setPermitirSlash}
                />
              </div>

              {/* Canais selecionados */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-white font-medium mb-4">
                  Os comandos da Kally funcionarão apenas em canais selecionados por você
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      CANAIS: {canaisSelecionados.length}
                    </span>
                    <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                      LIMPAR
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {canaisSelecionados.map((canal, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <span>{canal}</span>
                        <button
                          onClick={() => removerCanal(index)}
                          className="ml-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <select className="w-full max-w-xs bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>Selecione canais</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}