import React, { useState } from 'react';

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

export default function ReacoesAutomaticaContent() {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Reações automática</h1>
            <p className="text-gray-400">Configure reações automáticas para mensagens em canais específicos.</p>
          </div>
          <ToggleSwitch enabled={isEnabled} onChange={setIsEnabled} />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Lista de reações */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-white font-medium mb-6">Lista de reações</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Criar reação
                </button>
              </div>
              
              <div className="text-gray-400 text-sm">
                Nenhum painel configurado.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}