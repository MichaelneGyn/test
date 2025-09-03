import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Users, Crown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServidoresPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">Você precisa estar logado para ver seus servidores.</p>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meus Servidores</h1>
          <p className="text-gray-400">Gerencie todos os seus servidores Discord em um só lugar.</p>
        </div>

        <div className="grid gap-6">
          {user.servers.map((server) => (
            <div
              key={server.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Server Icon */}
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {server.name.charAt(0)}
                  </div>
                  
                  {/* Server Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{server.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{server.memberCount.toLocaleString()} membros</span>
                      </div>
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        <span className="capitalize">{server.role}</span>
                      </div>
                      {server.features.includes('premium') && (
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/dashboard?server=${server.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Link>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Server Card */}
        <div className="mt-8 bg-gray-800 rounded-xl p-8 border border-gray-700 border-dashed text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">+</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Adicionar Servidor</h3>
          <p className="text-gray-400 mb-6">
            Convide o MDbots para um novo servidor e comece a configurar.
          </p>
          <a
            href="https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=8&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Convidar Bot
          </a>
        </div>
      </div>
    </div>
  );
}