import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckCircle, Users, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrainerRegistrationPromptProps {
  title?: string;
  description?: string;
  showBenefits?: boolean;
}

const TrainerRegistrationPrompt = ({
  title = 'Registrate como Trainer',
  description = 'Debes registrarte como trainer para acceder a esta funcionalidad.',
  showBenefits = true,
}: TrainerRegistrationPromptProps) => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Users,
      title: 'Gestiona tus clientes',
      description: 'Vincula clientes y haz seguimiento de su progreso',
    },
    {
      icon: BarChart2,
      title: 'Crea planes personalizados',
      description: 'Disena rutinas de entrenamiento para cada cliente',
    },
    {
      icon: CheckCircle,
      title: 'Seguimiento de progresos',
      description: 'Monitorea los entrenamientos y resultados',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showBenefits && (
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button className="w-full" size="lg" onClick={() => navigate('/gym/trainer-settings')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Registrarme como Trainer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerRegistrationPrompt;
