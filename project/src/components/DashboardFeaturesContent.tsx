import React, { useState } from 'react';
import { 
  Star, 
  Link, 
  Volume2, 
  Shield, 
  Camera, 
  Ticket, 
  Hash, 
  Sparkles, 
  User, 
  MessageCircle, 
  Users, 
  Settings, 
  UserPlus, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  Zap, 
  BarChart3, 
  UserCheck,
  Move
} from 'lucide-react';

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

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isPremium: boolean;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

function FeatureCard({ icon: Icon, title, description, isPremium, enabled, onToggle }: FeatureCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 uppercase font-medium">
                {isPremium ? 'Premium' : 'Free'}
              </span>
            </div>
            <h3 className="text-white font-semibold">{title}</h3>
          </div>
        </div>
        <ToggleSwitch enabled={enabled} onChange={onToggle} />
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function DashboardFeaturesContent() {
  const [features, setFeatures] = useState({
    primeiraDama: true,
    protecaoUrl: true,
    tempoCall: true,
    protecaoServidor: true,
    instagram: true,
    tickets: true,
    logsEventos: true,
    vips: true,
    tellonym: true,
    bemVindo: true,
    moderacao: true,
    autorole: true,
    contadores: true,
    registro: true,
    mensagens: true,
    utilitarios: true,
    reacoesAutomatica: true,
    movChat: true,
    influencers: true,
    whitelist: true,
    migRec: true,
    bioChecker: true
  });

  const updateFeature = (key: string, value: boolean) => {
    setFeatures(prev => ({ ...prev, [key]: value }));
  };

  const featuresData = [
    {
      key: 'primeiraDama',
      icon: Star,
      title: 'Primeira Dama',
      description: 'Configure a permissão de ter primeira dama.',
      isPremium: true
    },
    {
      key: 'protecaoUrl',
      icon: Link,
      title: 'Proteção de Url',
      description: 'Mantenha a url do seu servidor protegida e evite que pessoas má intencionadas tomem posse.',
      isPremium: false
    },
    {
      key: 'tempoCall',
      icon: Volume2,
      title: 'Tempo em Call',
      description: 'Contabilize o tempo em call dos membros em seu servidor.',
      isPremium: true
    },
    {
      key: 'protecaoServidor',
      icon: Shield,
      title: 'Proteção de Servidor',
      description: 'Mantenha seu servidor protegido contra ataques.',
      isPremium: true
    },
    {
      key: 'instagram',
      icon: Camera,
      title: 'Instagram',
      description: 'Permita que seus membros postem fotos, recebam curtidas e comentários.',
      isPremium: false
    },
    {
      key: 'tickets',
      icon: Ticket,
      title: 'Tickets',
      description: 'Aumente a capacidade de atendimento aos seus membros com tickets, mantendo ao mesmo tempo os canais públicos limpos.',
      isPremium: true
    },
    {
      key: 'logsEventos',
      icon: Hash,
      title: 'Logs de Eventos',
      description: 'Mantenha seu servidor seguro com logs.',
      isPremium: true
    },
    {
      key: 'vips',
      icon: Sparkles,
      title: 'Vips',
      description: 'Dê aos membros a vantagem de ter canal de voz e cargo privado e 100% personalizável.',
      isPremium: true
    },
    {
      key: 'tellonym',
      icon: User,
      title: 'Tellonym',
      description: 'Tellonym é um meio de enviar mensagens anônimas. Ótimo para aumentar o entretenimento em sua comunidade!',
      isPremium: true
    },
    {
      key: 'bemVindo',
      icon: MessageCircle,
      title: 'Bem vindo & Adeus',
      description: 'Anuncie quem está entrando e saindo do seu servidor da maneira que você queria!',
      isPremium: false
    },
    {
      key: 'moderacao',
      icon: Shield,
      title: 'Moderação',
      description: 'Mantenha seu servidor seguro com moderação automática e capacite seus moderadores com poderosas ferramentas de moderação',
      isPremium: false
    },
    {
      key: 'autorole',
      icon: Users,
      title: 'Autorole',
      description: 'Autorole serve para você dar cargos para novos membros do seu servidor automaticamente quando eles entrarem no servidor',
      isPremium: false
    },
    {
      key: 'contadores',
      icon: BarChart3,
      title: 'Contadores',
      description: 'Configure contadores de membros em call ou da quantidade de membros em seu servidor.',
      isPremium: true
    },
    {
      key: 'registro',
      icon: FileText,
      title: 'Registro',
      description: 'Configure um sistema de registro, onde seus membros poderão receber tags personalizadas',
      isPremium: true
    },
    {
      key: 'mensagens',
      icon: MessageSquare,
      title: 'Mensagens',
      description: 'Configure mensagens personalizadas e envie em canais de texto',
      isPremium: true
    },
    {
      key: 'utilitarios',
      icon: Settings,
      title: 'Utilitários',
      description: 'Configure comandos gerais.',
      isPremium: false
    },
    {
      key: 'reacoesAutomatica',
      icon: Zap,
      title: 'Reações automática',
      description: 'Configure reações automáticas para mensagens em canais específicos.',
      isPremium: true
    },
    {
      key: 'movChat',
      icon: Move,
      title: 'Mov. Chat',
      description: 'Contabilize as mensagens em canais de texto de seus staffs.',
      isPremium: true
    },
    {
      key: 'influencers',
      icon: Hash,
      title: 'Influencers',
      description: 'Configure canais a serem postados fotos de destaque vinculado a redes sociais.',
      isPremium: true
    },
    {
      key: 'whitelist',
      icon: AlertTriangle,
      title: 'Whitelist',
      description: 'Verifique seus novos membros de forma fácil e prática!',
      isPremium: false
    },
    {
      key: 'migRec',
      icon: UserPlus,
      title: 'Mig & Rec',
      description: 'Configure os sistemas de migração e recrutamento',
      isPremium: true
    },
    {
      key: 'bioChecker',
      icon: UserCheck,
      title: 'Bio Checker',
      description: 'Verifique automaticamente os usuários que possuem algo na bio, status ou pronome.',
      isPremium: true
    }
  ];

  return (
    <div className="w-full bg-gray-900 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Configurações do Servidor</h1>
          <p className="text-gray-400">Personalize e configure todos os recursos do MDbots para seu servidor.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.key}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              isPremium={feature.isPremium}
              enabled={features[feature.key as keyof typeof features]}
              onToggle={(enabled) => updateFeature(feature.key, enabled)}
            />
          ))}
        </div>

        {/* Premium Notice */}
        <div className="mt-8 pb-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center space-x-3 mb-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Funcionalidades Premium</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Libere todo o potencial do MDbots e crie uma experiência excepcional para sua comunidade!
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Ativar Premium
          </button>
        </div>
      </div>
    </div>
  );
}