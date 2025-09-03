import React from 'react';
import { MessageCircle, Users, Clock, Shield, ExternalLink, CheckCircle } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function ServidorSuportePage() {
  const stats = [
    { label: 'Membros Online', value: '2,847', icon: Users, color: 'text-green-400' },
    { label: 'Tickets Resolvidos', value: '15,392', icon: CheckCircle, color: 'text-blue-400' },
    { label: 'Tempo Médio', value: '< 2h', icon: Clock, color: 'text-yellow-400' },
    { label: 'Satisfação', value: '98%', icon: Shield, color: 'text-purple-400' }
  ];

  const channels = [
    {
      name: '📢・anúncios',
      description: 'Fique por dentro das novidades e atualizações do MDbots',
      type: 'Anúncios'
    },
    {
      name: '❓・suporte-geral',
      description: 'Tire suas dúvidas sobre configuração e uso básico',
      type: 'Suporte'
    },
    {
      name: '🛠️・suporte-técnico',
      description: 'Problemas técnicos e bugs reportados aqui',
      type: 'Técnico'
    },
    {
      name: '💎・suporte-premium',
      description: 'Suporte exclusivo para usuários premium',
      type: 'Premium'
    },
    {
      name: '💡・sugestões',
      description: 'Compartilhe suas ideias para melhorar o bot',
      type: 'Feedback'
    },
    {
      name: '🎉・comunidade',
      description: 'Converse com outros usuários e compartilhe experiências',
      type: 'Social'
    }
  ];

  const features = [
    {
      icon: MessageCircle,
      title: 'Suporte 24/7',
      description: 'Nossa equipe está sempre disponível para ajudar você'
    },
    {
      icon: Users,
      title: 'Comunidade Ativa',
      description: 'Mais de 50.000 usuários compartilhando conhecimento'
    },
    {
      icon: Shield,
      title: 'Suporte Especializado',
      description: 'Equipe técnica especializada em Discord e bots'
    },
    {
      icon: Clock,
      title: 'Resposta Rápida',
      description: 'Tempo médio de resposta inferior a 2 horas'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Central de Suporte
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Conecte-se com nossa comunidade ativa! Obtenha ajuda especializada, 
              compartilhe conhecimento e acompanhe as últimas atualizações do MDbots.
            </p>
            
            <a
              href="https://discord.gg/mdbots"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Entrar no Discord
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
                  <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Features */}
        <ScrollReveal delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Channels */}
        <ScrollReveal delay={400}>
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Canais Disponíveis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel, index) => (
                <div key={channel.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{channel.name}</h3>
                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                      {channel.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{channel.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal delay={500}>
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Dúvidas Comuns
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Como posso obter suporte?
                </h3>
                <p className="text-gray-400 mb-6">
                  Entre no nosso servidor Discord e abra um ticket no canal apropriado. Nossa equipe responderá o mais rápido possível.
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">
                  O suporte é gratuito?
                </h3>
                <p className="text-gray-400">
                  Sim! Oferecemos suporte gratuito para todos os usuários. Usuários premium têm prioridade no atendimento.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Qual o horário de funcionamento?
                </h3>
                <p className="text-gray-400 mb-6">
                  Nossa comunidade está ativa 24/7. A equipe oficial responde de segunda a sexta, das 9h às 18h (horário de Brasília).
                </p>

                <h3 className="text-lg font-semibold text-white mb-3">
                  Posso sugerir melhorias?
                </h3>
                <p className="text-gray-400">
                  Claro! Temos um canal específico para sugestões. Sua opinião é muito importante para nós.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={600}>
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Vamos começar?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Faça parte da nossa comunidade e revolucione seu servidor Discord agora!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://discord.gg/mdbots"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Entrar no Discord
              </a>
              <a
                href="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Acessar Painel
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}