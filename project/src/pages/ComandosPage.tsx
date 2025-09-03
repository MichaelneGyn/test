import React, { useState } from 'react';
import { Search, Hash, Shield, Music, Gamepad2, Settings, Crown, Zap } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function ComandosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: Hash, count: 85 },
    { id: 'moderation', name: 'Moderação', icon: Shield, count: 15 },
    { id: 'music', name: 'Música', icon: Music, count: 12 },
    { id: 'fun', name: 'Diversão', icon: Gamepad2, count: 20 },
    { id: 'utility', name: 'Utilidades', icon: Settings, count: 18 },
    { id: 'premium', name: 'Premium', icon: Crown, count: 20 }
  ];

  const commands = [
    // Moderação
    { name: '/ban', description: 'Banir um usuário do servidor', category: 'moderation', premium: false },
    { name: '/kick', description: 'Expulsar um usuário do servidor', category: 'moderation', premium: false },
    { name: '/mute', description: 'Silenciar um usuário', category: 'moderation', premium: false },
    { name: '/warn', description: 'Advertir um usuário', category: 'moderation', premium: false },
    { name: '/clear', description: 'Limpar mensagens do chat', category: 'moderation', premium: false },
    { name: '/timeout', description: 'Dar timeout em um usuário', category: 'moderation', premium: false },
    { name: '/unban', description: 'Desbanir um usuário', category: 'moderation', premium: true },
    { name: '/unmute', description: 'Retirar silenciamento', category: 'moderation', premium: true },
    { name: '/slowmode', description: 'Configurar modo lento', category: 'moderation', premium: true },
    { name: '/lockdown', description: 'Bloquear canal', category: 'moderation', premium: true },
    { name: '/massban', description: 'Banir múltiplos usuários', category: 'moderation', premium: true },
    { name: '/automod', description: 'Configurar moderação automática', category: 'moderation', premium: true },
    { name: '/antiraid', description: 'Ativar proteção anti-raid', category: 'moderation', premium: true },
    { name: '/whitelist', description: 'Gerenciar lista branca', category: 'moderation', premium: true },
    { name: '/logs', description: 'Configurar logs de moderação', category: 'moderation', premium: true },

    // Música
    { name: '/play', description: 'Tocar uma música', category: 'music', premium: false },
    { name: '/pause', description: 'Pausar a música atual', category: 'music', premium: false },
    { name: '/skip', description: 'Pular para próxima música', category: 'music', premium: false },
    { name: '/queue', description: 'Ver fila de reprodução', category: 'music', premium: false },
    { name: '/volume', description: 'Ajustar volume', category: 'music', premium: false },
    { name: '/stop', description: 'Parar reprodução', category: 'music', premium: false },
    { name: '/loop', description: 'Repetir música/playlist', category: 'music', premium: true },
    { name: '/shuffle', description: 'Embaralhar playlist', category: 'music', premium: true },
    { name: '/lyrics', description: 'Mostrar letra da música', category: 'music', premium: true },
    { name: '/playlist', description: 'Gerenciar playlists', category: 'music', premium: true },
    { name: '/radio', description: 'Tocar rádio online', category: 'music', premium: true },
    { name: '/soundboard', description: 'Usar soundboard', category: 'music', premium: true },

    // Diversão
    { name: '/meme', description: 'Enviar um meme aleatório', category: 'fun', premium: false },
    { name: '/joke', description: 'Contar uma piada', category: 'fun', premium: false },
    { name: '/8ball', description: 'Bola de cristal mágica', category: 'fun', premium: false },
    { name: '/dice', description: 'Rolar dados', category: 'fun', premium: false },
    { name: '/coinflip', description: 'Cara ou coroa', category: 'fun', premium: false },
    { name: '/avatar', description: 'Ver avatar de usuário', category: 'fun', premium: false },
    { name: '/ship', description: 'Calcular compatibilidade', category: 'fun', premium: false },
    { name: '/quiz', description: 'Jogar quiz', category: 'fun', premium: true },
    { name: '/trivia', description: 'Perguntas e respostas', category: 'fun', premium: true },
    { name: '/rps', description: 'Pedra, papel, tesoura', category: 'fun', premium: true },
    { name: '/slots', description: 'Máquina caça-níqueis', category: 'fun', premium: true },
    { name: '/blackjack', description: 'Jogar blackjack', category: 'fun', premium: true },
    { name: '/poker', description: 'Jogar poker', category: 'fun', premium: true },
    { name: '/bingo', description: 'Jogar bingo', category: 'fun', premium: true },
    { name: '/lottery', description: 'Loteria do servidor', category: 'fun', premium: true },
    { name: '/pet', description: 'Sistema de pets virtuais', category: 'fun', premium: true },
    { name: '/marriage', description: 'Sistema de casamento', category: 'fun', premium: true },
    { name: '/divorce', description: 'Sistema de divórcio', category: 'fun', premium: true },
    { name: '/daily', description: 'Recompensa diária', category: 'fun', premium: true },
    { name: '/weekly', description: 'Recompensa semanal', category: 'fun', premium: true },

    // Utilidades
    { name: '/help', description: 'Mostrar ajuda', category: 'utility', premium: false },
    { name: '/ping', description: 'Ver latência do bot', category: 'utility', premium: false },
    { name: '/serverinfo', description: 'Informações do servidor', category: 'utility', premium: false },
    { name: '/userinfo', description: 'Informações do usuário', category: 'utility', premium: false },
    { name: '/weather', description: 'Ver clima', category: 'utility', premium: false },
    { name: '/translate', description: 'Traduzir texto', category: 'utility', premium: false },
    { name: '/calculator', description: 'Calculadora', category: 'utility', premium: false },
    { name: '/qr', description: 'Gerar QR Code', category: 'utility', premium: true },
    { name: '/shorten', description: 'Encurtar URL', category: 'utility', premium: true },
    { name: '/remind', description: 'Criar lembrete', category: 'utility', premium: true },
    { name: '/poll', description: 'Criar enquete', category: 'utility', premium: true },
    { name: '/giveaway', description: 'Criar sorteio', category: 'utility', premium: true },
    { name: '/embed', description: 'Criar embed personalizado', category: 'utility', premium: true },
    { name: '/announce', description: 'Fazer anúncio', category: 'utility', premium: true },
    { name: '/backup', description: 'Backup do servidor', category: 'utility', premium: true },
    { name: '/restore', description: 'Restaurar backup', category: 'utility', premium: true },
    { name: '/analytics', description: 'Estatísticas do servidor', category: 'utility', premium: true },
    { name: '/export', description: 'Exportar dados', category: 'utility', premium: true },

    // Premium
    { name: '/vip', description: 'Gerenciar sistema VIP', category: 'premium', premium: true },
    { name: '/ticket', description: 'Sistema de tickets avançado', category: 'premium', premium: true },
    { name: '/autorole', description: 'Configurar cargos automáticos', category: 'premium', premium: true },
    { name: '/welcome', description: 'Mensagem de boas-vindas', category: 'premium', premium: true },
    { name: '/goodbye', description: 'Mensagem de despedida', category: 'premium', premium: true },
    { name: '/leveling', description: 'Sistema de níveis', category: 'premium', premium: true },
    { name: '/economy', description: 'Sistema de economia', category: 'premium', premium: true },
    { name: '/shop', description: 'Loja do servidor', category: 'premium', premium: true },
    { name: '/inventory', description: 'Inventário do usuário', category: 'premium', premium: true },
    { name: '/work', description: 'Sistema de trabalho', category: 'premium', premium: true },
    { name: '/rob', description: 'Roubar outros usuários', category: 'premium', premium: true },
    { name: '/bank', description: 'Sistema bancário', category: 'premium', premium: true },
    { name: '/invest', description: 'Sistema de investimentos', category: 'premium', premium: true },
    { name: '/stocks', description: 'Mercado de ações', category: 'premium', premium: true },
    { name: '/crypto', description: 'Criptomoedas virtuais', category: 'premium', premium: true },
    { name: '/auction', description: 'Sistema de leilões', category: 'premium', premium: true },
    { name: '/leaderboard', description: 'Ranking do servidor', category: 'premium', premium: true },
    { name: '/achievements', description: 'Sistema de conquistas', category: 'premium', premium: true },
    { name: '/badges', description: 'Sistema de badges', category: 'premium', premium: true },
    { name: '/custom', description: 'Comandos personalizados', category: 'premium', premium: true }
  ];

  const filteredCommands = commands.filter(command => {
    const matchesSearch = command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         command.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || command.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Central de Comandos
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore nossa biblioteca completa de comandos. Mais de 85 funcionalidades 
              organizadas por categoria para facilitar sua experiência.
            </p>
          </div>
        </ScrollReveal>

        {/* Search and Filters */}
        <ScrollReveal delay={200}>
          <div className="mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar comandos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                    <span className="ml-2 bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommands.map((command, index) => (
            <ScrollReveal key={command.name} delay={index * 50}>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <code className="bg-gray-700 text-purple-400 px-3 py-1 rounded-md font-mono text-sm">
                      {command.name}
                    </code>
                    {command.premium && (
                      <Crown className="w-4 h-4 text-yellow-400 ml-2" />
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {command.description}
                </p>
                {command.premium && (
                  <div className="mt-3 flex items-center text-xs text-yellow-400">
                    <Zap className="w-3 h-3 mr-1" />
                    Recurso Premium
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* No Results */}
        {filteredCommands.length === 0 && (
          <ScrollReveal>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum comando encontrado
              </h3>
              <p className="text-gray-400">
                Tente ajustar sua busca ou filtros para encontrar o que procura.
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Premium CTA */}
        <ScrollReveal delay={400}>
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Libere Todo o Potencial
            </h2>
            <p className="text-xl text-gray-200 mb-6">
              Tenha acesso completo a todos os comandos premium e recursos avançados!
            </p>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg transition-colors">
              Ativar Premium
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}