import React from 'react';
import { ArrowRight, Bot, Calendar, MessageSquare, BarChart3, CheckCircle } from 'lucide-react';
import { LoginButton } from '@/components/LoginButton';
import { SignupButton } from '@/components/SignupButton';
import { FeatureCard } from './FeatureCard';

const benefits = [
  'Reduce hasta 80% las consultas repetitivas',
  'Atencion al cliente 24/7 sin costo adicional',
  'Integracion directa con WhatsApp Business',
  'Sin necesidad de conocimientos tecnicos',
  'Configuracion en menos de 15 minutos',
  'Soporte multi-idioma automatico'
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Gestiona tu negocio con{' '}
            <span className="text-primary">inteligencia artificial</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Condamind automatiza la atencion al cliente, agenda turnos y
            gestiona pedidos a traves de WhatsApp con asistentes IA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SignupButton size="lg" className="w-full sm:w-auto">
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </SignupButton>
            <LoginButton variant="outline" size="lg" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Todo lo que necesitas para tu negocio
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Bot className="h-10 w-10" />}
            title="Asistente IA 24/7"
            description="Responde consultas automaticamente por WhatsApp"
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10" />}
            title="Agenda Inteligente"
            description="Gestion automatica de turnos y citas"
          />
          <FeatureCard
            icon={<MessageSquare className="h-10 w-10" />}
            title="Chat Unificado"
            description="Todas las conversaciones en un solo lugar"
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10" />}
            title="Metricas en Tiempo Real"
            description="Analiza el rendimiento de tu negocio"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-card rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Por que elegir Condamind?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Listo para empezar?</h2>
        <p className="text-muted-foreground mb-6">
          Crea tu cuenta gratis y empieza a automatizar tu negocio hoy.
        </p>
        <SignupButton size="lg">
          Comenzar Ahora
          <ArrowRight className="ml-2 h-4 w-4" />
        </SignupButton>
      </section>
    </div>
  );
};
