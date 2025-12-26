import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessType, BusinessType } from '@/context/BusinessTypeContext';
import {
  Bot,
  Calendar,
  MessageSquare,
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Dumbbell,
  Hotel,
  Target,
  Building2
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const BusinessTypeSelector: React.FC<{
  selected: BusinessType;
  onSelect: (type: BusinessType) => void;
}> = ({ selected, onSelect }) => {
  const options: { type: Exclude<BusinessType, null>; icon: React.ReactNode; label: string; description: string }[] = [
    {
      type: 'gym',
      icon: <Dumbbell className="h-8 w-8" />,
      label: 'Gimnasio',
      description: 'Gestiona miembros, clases y pagos'
    },
    {
      type: 'hotel',
      icon: <Hotel className="h-8 w-8" />,
      label: 'Hoteleria',
      description: 'Gestiona reservas y habitaciones'
    },
    {
      type: 'habits',
      icon: <Target className="h-8 w-8" />,
      label: 'Habitos',
      description: 'Ayuda a tus usuarios a crear habitos'
    }
  ];

  return (
    <div className="grid gap-4">
      {options.map((option) => (
        <Card
          key={option.type}
          className={`p-4 cursor-pointer transition-all hover:border-primary ${
            selected === option.type ? 'border-primary bg-primary/5 ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(option.type)}
        >
          <div className="flex items-center gap-4">
            <div className={`${selected === option.type ? 'text-primary' : 'text-muted-foreground'}`}>
              {option.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
            {selected === option.type && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType>(null);
  const { completeOnboarding } = useOnboarding();
  const { setBusinessType } = useBusinessType();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.given_name || user?.name?.split(' ')[0] || 'usuario';

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenido a Condamind!',
      description: `Hola ${userName}! Preparemos tu cuenta en unos simples pasos.`,
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Condamind te ayuda a gestionar tu negocio de forma inteligente
            usando asistentes de IA integrados con WhatsApp.
          </p>
          <div className="flex justify-center gap-8 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Atencion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">80%</div>
              <div className="text-sm text-muted-foreground">Menos consultas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5min</div>
              <div className="text-sm text-muted-foreground">Setup</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'business-type',
      title: 'Que tipo de negocio tienes?',
      description: 'Selecciona el tipo de negocio para personalizar tu experiencia',
      icon: <Building2 className="h-12 w-12 text-primary" />,
      content: (
        <BusinessTypeSelector
          selected={selectedBusinessType}
          onSelect={setSelectedBusinessType}
        />
      )
    },
    {
      id: 'assistant',
      title: 'Tu Asistente IA',
      description: 'Configura tu asistente virtual para responder automaticamente',
      icon: <Bot className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Tu asistente puede:</p>
          <ul className="space-y-2">
            {[
              'Responder preguntas frecuentes',
              'Informar sobre tus productos y servicios',
              'Derivar consultas complejas a humanos',
              'Aprender de tus respuestas anteriores'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'calendar',
      title: 'Agenda de Turnos',
      description: 'Permite que tus clientes agenden citas automaticamente',
      icon: <Calendar className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Con la agenda inteligente puedes:</p>
          <ul className="space-y-2">
            {[
              'Definir horarios de atencion',
              'Recibir reservas por WhatsApp',
              'Enviar recordatorios automaticos',
              'Gestionar cancelaciones'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'whatsapp',
      title: 'Integracion WhatsApp',
      description: 'Conecta tu numero de WhatsApp Business',
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Para conectar WhatsApp necesitaras:</p>
          <ul className="space-y-2">
            {[
              'Una cuenta de WhatsApp Business',
              'Acceso a Meta Business Suite',
              'Un numero de telefono verificado'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            No te preocupes! Te guiaremos en el proceso de integracion.
          </p>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Todo listo!',
      description: 'Tu cuenta esta configurada y lista para usar',
      icon: <Check className="h-12 w-12 text-primary" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Ya puedes empezar a usar Condamind!
            Te recomendamos explorar estas secciones primero:
          </p>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
              <Bot className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">Asistente</div>
            </Card>
            <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">Calendario</div>
            </Card>
            <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
              <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">Mensajes</div>
            </Card>
            <Card className="p-4 cursor-pointer hover:bg-accent transition-colors">
              <Settings className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">Configuracion</div>
            </Card>
          </div>
        </div>
      )
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    // Si estamos en el paso de business-type, guardar la seleccion
    if (currentStepData.id === 'business-type' && selectedBusinessType) {
      setBusinessType(selectedBusinessType);
    }

    if (isLastStep) {
      completeOnboarding();
      navigate('/');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Determinar si el boton Siguiente debe estar deshabilitado
  const isNextDisabled = currentStepData.id === 'business-type' && !selectedBusinessType;

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{currentStepData.icon}</div>
          <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>

        <CardContent className="min-h-[200px]">{currentStepData.content}</CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Progress value={progress} className="w-full" />

          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={handlePrev} disabled={isFirstStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <Button variant="link" onClick={handleSkip}>
              Saltar
            </Button>

            <Button onClick={handleNext} disabled={isNextDisabled}>
              {isLastStep ? 'Comenzar' : 'Siguiente'}
              {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentStep
                    ? 'bg-primary'
                    : i < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
