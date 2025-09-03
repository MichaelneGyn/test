import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  MessageSquare, 
  Ticket, 
  Clock, 
  Crown, 
  Bot,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Zap
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Notification Banner */}
            {/* Main Heading */}
            <ScrollReveal delay={200}>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Revolucione seu<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Discord Server!
                </span>
              </h1>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal delay={400}>
              <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Eleve seu servidor Discord a um novo patamar com MDbots! Oferecemos segurança 
                avançada, automação inteligente, sistemas de engajamento e ferramentas completas 
                de gestão. Tudo em uma plataforma integrada e fácil de usar.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={600}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/login"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  Me Adicione
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 border border-gray-700 hover:border-gray-600"
                >
                  Acessar Painel
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Plataforma completa de gestão Discord
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Centralize todas as funcionalidades que seu servidor precisa em uma única 
                solução. Desde proteção até entretenimento, tudo configurável através do 
                nosso painel intuitivo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Proteção Anti Raid */}
            <ScrollReveal delay={200}>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Proteção Anti Raid</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Sistema avançado de proteção contra invasões e ataques coordenados.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Limite de ações</span>
                    <span className="text-purple-400">3 channels in 1 min</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Punição aplicada</span>
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs">User Ban</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Proteção de cargos</span>
                    <span className="text-purple-400">Permissões administrativas</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Moderação */}
            <ScrollReveal delay={400}>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Moderação</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Automação inteligente para manter seu servidor organizado e seguro.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">ANTI SPAM</span>
                    <div className="w-8 h-4 bg-gray-600 rounded-full flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full ml-4"></div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-300">
                    Deletar mensagem
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">ANTI INVITES</span>
                    <div className="w-8 h-4 bg-gray-600 rounded-full flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full ml-4"></div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-300">
                    Deletar mensagem & Notificar usuário
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Sistema de Tickets */}
            <ScrollReveal delay={600}>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Ticket className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Sistema de Tickets</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Organize o atendimento da sua comunidade de forma profissional.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Ticket #1</span>
                    <span className="text-purple-400">2 panels</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Moderator Roles</span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Moderator</span>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-xs text-gray-400 mb-2">Select Menu</div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Star className="w-4 h-4 mr-2 text-yellow-400" />
                      Menu Item #1
                      <span className="ml-auto text-xs text-gray-400">Open Ticket</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Sistema de Mensagens */}
            <ScrollReveal delay={200}>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Sistema de Mensagens</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Crie mensagens personalizadas com embeds e componentes interativos.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Message #1</span>
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Message #2</span>
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-xs text-gray-400 mb-2">Select Menu</div>
                    <div className="flex items-center text-sm text-gray-300">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      Menu Item #1
                      <span className="ml-auto text-xs text-gray-400">2 actions</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Tempo em Call */}
            <ScrollReveal delay={400}>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Tempo em Call</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Monitore e gamifique o tempo de permanência em canais de voz.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Ranking</span>
                    <span className="text-purple-400">200 users</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white mr-2">1</div>
                        <span className="text-gray-300">Clyde#9292</span>
                      </div>
                      <span className="text-gray-400">10 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white mr-2">2</div>
                        <span className="text-gray-300">RicardoCapa#9292</span>
                      </div>
                      <span className="text-gray-400">6 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white mr-2">3</div>
                        <span className="text-gray-300">SherlockHome#9292</span>
                      </div>
                      <span className="text-gray-400">2 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Sistema de Vips */}
            <ScrollReveal delay={600}>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Sistema de Vips</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Ofereça experiências premium personalizadas para membros especiais.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Vip #1</span>
                    <span className="text-purple-400">2 users</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Vip Roles</span>
                    <div className="flex space-x-1">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Exclusive</span>
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">Vip Master</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Dê aos membros a vantagem de ter canal de voz e cargo privado e 100% personalizável.
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <ScrollReveal className="lg:w-1/2">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Solução completa<br />
                  e econômica
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Substitua múltiplos bots por uma única solução integrada. Tenha todas as 
                  funcionalidades que precisa em um painel centralizado, com economia 
                  significativa e gestão simplificada.
                </p>
                <Link
                  to="/planos"
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors group"
                >
                  Ver Preços
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Right Content - Pricing Cards */}
            <div className="lg:w-1/2 flex flex-col space-y-6">
              {/* MDbots Card */}
              <ScrollReveal delay={200}>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                      <Bot className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">MDbots Bot</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Desenvolvido com foco na experiência do usuário</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Personalização avançada e intuitiva</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Gestão completa do servidor</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Interface moderna e responsiva</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Plano gratuito robusto</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Alta disponibilidade garantida</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>Suporte técnico especializado</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      R$ 0 - R$ 30 <span className="text-lg text-gray-400">/mês</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Solução completa com economia de até R$1,200 por ano
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Comparison Card */}
              <ScrollReveal delay={400}>
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-white mb-1">R028</div>
                      <div className="text-sm text-gray-300">R$ 55.00</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white mb-1">NewBots</div>
                      <div className="text-sm text-gray-300">R$ 30.00</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white mb-1">NBots</div>
                      <div className="text-sm text-gray-300">R$ 30.00</div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4 pt-4 border-t border-gray-600">
                    <div className="text-2xl font-bold text-red-400 mb-2">
                      R$ 115+ <span className="text-lg text-gray-400">/mês</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Custo total usando múltiplos bots para ter as mesmas funcionalidades 
                      que oferecemos em uma única solução.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="w-8 h-8 text-purple-500" />
                <span className="text-xl font-bold text-white">MDbots</span>
              </div>
              <p className="text-gray-400 mb-4">O melhor bot para o Discord!</p>
              <p className="text-sm text-gray-500">© 2025 MDbots. Todos os direitos reservados.</p>
            </div>

            {/* MDbots Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">MDbots</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/servidor-de-suporte" className="text-gray-400 hover:text-white transition-colors">
                    Servidor de Suporte
                  </Link>
                </li>
                <li>
                  <Link to="/planos" className="text-gray-400 hover:text-white transition-colors">
                    Planos
                  </Link>
                </li>
                <li>
                  <Link to="/comandos" className="text-gray-400 hover:text-white transition-colors">
                    Comandos
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Links */}
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
}