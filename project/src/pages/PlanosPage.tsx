import React from 'react';
import { Check, Star, Crown, Zap } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function PlanosPage() {
  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Comandos básicos',
        'Moderação simples',
        'Suporte da comunidade',
        'Até 100 membros'
      ],
      buttonText: 'Começar Grátis',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700',
      popular: false
    },
    {
      name: 'Premium',
      price: 'R$ 15',
      period: '/mês',
      description: 'Para servidores em crescimento',
      features: [
        'Todos os recursos gratuitos',
        'Sistema de tickets',
        'Logs avançados',
        'Proteção anti-raid',
        'Suporte prioritário',
        'Até 1000 membros'
      ],
      buttonText: 'Escolher Premium',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'R$ 30',
      period: '/mês',
      description: 'Para grandes comunidades',
      features: [
        'Todos os recursos premium',
        'Sistema de VIPs',
        'Automações avançadas',
        'API personalizada',
        'Suporte 24/7',
        'Membros ilimitados'
      ],
      buttonText: 'Escolher Enterprise',
      buttonStyle: 'bg-yellow-600 hover:bg-yellow-700',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Planos que se adaptam ao seu servidor
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Desde funcionalidades básicas até recursos premium avançados. 
              Inicie gratuitamente e expanda conforme sua comunidade evolui.
            </p>
          </div>
        </ScrollReveal>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 200}>
              <div className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison Section */}
        <ScrollReveal>
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Economize com MDbots
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Com outros bots você pagaria:
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-300">R028 Bot</span>
                    <span className="text-red-400 font-semibold">R$ 55,00/mês</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-300">NewBots</span>
                    <span className="text-red-400 font-semibold">R$ 30,00/mês</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-300">NBots</span>
                    <span className="text-red-400 font-semibold">R$ 30,00/mês</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-red-400 font-bold text-xl">R$ 115,00/mês</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6">
                  <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">MDbots Premium</h3>
                  <div className="text-4xl font-bold text-white mb-2">R$ 15,00</div>
                  <div className="text-green-400 font-semibold mb-4">
                    Economize R$ 100,00/mês
                  </div>
                  <div className="text-green-400 font-bold text-xl">
                    +R$ 1.200 por ano!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal delay={200}>
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Perguntas Frequentes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Posso cancelar a qualquer momento?
                </h3>
                <p className="text-gray-400">
                  Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  O bot funciona 24/7?
                </h3>
                <p className="text-gray-400">
                  Sim! Garantimos 99.99% de uptime para que seu servidor esteja sempre protegido.
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Há limite de servidores?
                </h3>
                <p className="text-gray-400">
                  No plano gratuito você pode usar em 1 servidor. Nos planos pagos, sem limites!
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Como funciona o suporte?
                </h3>
                <p className="text-gray-400">
                  Oferecemos suporte via Discord. Premium e Enterprise têm suporte prioritário.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}