import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Copy,
  CheckCircle,
  Instagram,
  Globe,
  Users,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useGymWorkoutPlans } from '@/hooks/gym/useGymWorkoutPlans';
import TrainerRegistrationPrompt from '@/components/gym/TrainerRegistrationPrompt';

const TrainerSettings = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);

  const { useTrainer } = useGymWorkoutPlans();
  const { data: trainer, isLoading, error } = useTrainer();

  const isTrainer = !!trainer && !error;

  const copyInviteCode = () => {
    if (trainer?.inviteCode) {
      navigator.clipboard.writeText(trainer.inviteCode);
      setCopiedCode(true);
      toast({
        title: 'Codigo copiado',
        description: 'El codigo de invitacion ha sido copiado al portapapeles.',
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Not a trainer yet - show registration
  if (!isTrainer) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <TrainerRegistrationPrompt
            title="Conviertete en Trainer"
            description="Registrate como entrenador personal para gestionar clientes y asignar planes de entrenamiento."
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Beneficios del Panel de Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Codigo de invitacion unico para vincular clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Crear y asignar planes de entrenamiento personalizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Ver el progreso y estadisticas de tus clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Acceso al catalogo de 2,200+ ejercicios con videos</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a
                  href="https://gym.condamind.com/trainer/register"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Registrarme en Gym App
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Trainer profile view
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuracion de Trainer</h1>
            <p className="text-muted-foreground">Tu perfil y codigo de invitacion</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-fit">
              <Users className="h-3 w-3 mr-1" />
              {trainer.activeClientCount} / {trainer.maxClients || 50} clientes
            </Badge>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://gym.condamind.com/trainer/settings"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Editar en Gym App
              </a>
            </Button>
          </div>
        </div>

        {/* Invite Code Card */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Codigo de Invitacion
            </CardTitle>
            <CardDescription>
              Comparte este codigo con tus clientes para que se vinculen contigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted rounded-lg p-4 text-center">
                <span className="text-3xl font-mono font-bold tracking-wider">
                  {trainer.inviteCode}
                </span>
              </div>
              <Button
                variant={copiedCode ? 'default' : 'outline'}
                size="icon"
                onClick={copyInviteCode}
              >
                {copiedCode ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Los clientes ingresan este codigo en gym.condamind.com para vincularse
            </p>
          </CardFooter>
        </Card>

        {/* Profile Card - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Trainer
            </CardTitle>
            <CardDescription>
              Tu informacion profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nombre del negocio</p>
                <p className="font-medium">{trainer.businessName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Especialidad</p>
                <p className="font-medium">{trainer.specialty || '-'}</p>
              </div>
            </div>

            {trainer.bio && (
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="font-medium">{trainer.bio}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {trainer.instagramHandle && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{trainer.instagramHandle}</span>
                </div>
              )}
              {trainer.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={trainer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {trainer.website}
                  </a>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Limite de clientes</p>
              <p className="font-medium">{trainer.maxClients || 50} clientes</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <a
                href="https://gym.condamind.com/trainer/settings"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Editar Perfil en Gym App
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainerSettings;
