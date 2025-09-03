import React from 'react';
import { Crown } from 'lucide-react';

export default function FinanceiroContent() {
  return (
    <div className="flex-1 bg-gray-900 h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-gray-400">Veja as informações referente a inscrição premium do servidor</p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Informações do bot */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-medium border-l-4 border-purple-500 pl-3">
                  Informações do bot
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">F</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">FOLK#5022</h4>
                      <p className="text-gray-400 text-sm">1134564688512958504</p>
                    </div>
                  </div>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    Renovar Premium
                  </button>
                </div>
              </div>
            </div>

            {/* Histórico de pagamentos */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-medium border-l-4 border-purple-500 pl-3">
                  Histórico de pagamentos
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Payment Entry 1 */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">F</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium">folkdc</h5>
                        <p className="text-gray-400 text-sm">21/07/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-medium">Adquirido</span>
                      <p className="text-green-400 text-sm">+ 30 Dias</p>
                    </div>
                  </div>

                  {/* Payment Entry 2 */}
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">F</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium">folkdc</h5>
                        <p className="text-gray-400 text-sm">24/06/2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-medium">Adquirido</span>
                      <p className="text-green-400 text-sm">+ 30 Dias</p>
                    </div>
                  </div>
                </div>

                {/* Load More Button */}
                <div className="text-center mt-6">
                  <button className="text-gray-400 hover:text-white transition-colors text-sm">
                    Carregar mais...
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Informações de inscrição */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-medium border-l-4 border-purple-500 pl-3">
                  Informações de inscrição
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Início:</span>
                    <span className="text-white">24/07/2025</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Termina:</span>
                    <span className="text-white">sábado às 12:45</span>
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