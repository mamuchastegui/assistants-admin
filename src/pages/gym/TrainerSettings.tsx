import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Copy,
  RefreshCw,
  CheckCircle,
  Instagram,
  Globe,
  Users,
  Settings,
  Share2,
  QrCode,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useGymTrainer, type TrainerRegisterData, type TrainerUpdateData } from '@/hooks/gym/useGymTrainer';

const TrainerSettings = () => {
  const { toast } = useToast();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [registerData, setRegisterData] = useState<TrainerRegisterData>({
    business_name: '',
    specialty: '',
    bio: '',
    instagram_handle: '',
    website: '',
  });
  const [updateData, setUpdateData] = useState<TrainerUpdateData>({});

  const {
    useTrainerProfile,
    useRegisterTrainer,
    useUpdateTrainerProfile,
    useRegenerateInviteCode,
  } = useGymTrainer();

  const { data: trainer, isLoading, error } = useTrainerProfile();
  const registerMutation = useRegisterTrainer();
  const updateMutation = useUpdateTrainerProfile();
  const regenerateMutation = useRegenerateInviteCode();

  const isTrainer = !!trainer && !error;

  const copyInviteCode = () => {
    if (trainer?.invite_code) {
      navigator.clipboard.writeText(trainer.invite_code);
      toast({
        title: 'Codigo copiado',
        description: 'El codigo de invitacion ha sido copiado al portapapeles.',
      });
    }
  };

  const shareInviteCode = () => {
    if (trainer?.invite_code && navigator.share) {
      navigator.share({
        title: 'Unete a mi entrenamiento',
        text: `Usa el codigo ${trainer.invite_code} para vincularte conmigo como tu entrenador personal.`,
      });
    } else {
      copyInviteCode();
    }
  };

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync(registerData);
      toast({
        title: 'Registro exitoso',
        description: 'Ahora eres un trainer registrado.',
      });
      setShowRegisterDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo completar el registro.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync(updateData);
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados.',
      });
      setUpdateData({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync();
      toast({
        title: 'Codigo regenerado',
        description: 'Tu nuevo codigo de invitacion esta listo.',
      });
      setShowRegenerateDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo regenerar el codigo.',
        variant: 'destructive',
      });
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
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Conviertete en Trainer</h1>
            <p className="text-muted-foreground">
              Registrate como entrenador personal para gestionar clientes y asignar planes de entrenamiento.
            </p>
          </div>

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
              <Button onClick={() => setShowRegisterDialog(true)} className="w-full">
                Registrarme como Trainer
              </Button>
            </CardFooter>
          </Card>

          {/* Register Dialog */}
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registro de Trainer</DialogTitle>
                <DialogDescription>
                  Completa tu perfil de entrenador personal
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Nombre del negocio (opcional)</Label>
                  <Input
                    id="business_name"
                    value={registerData.business_name}
                    onChange={(e) => setRegisterData({ ...registerData, business_name: e.target.value })}
                    placeholder="Ej: FitCoach Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialidad (opcional)</Label>
                  <Input
                    id="specialty"
                    value={registerData.specialty}
                    onChange={(e) => setRegisterData({ ...registerData, specialty: e.target.value })}
                    placeholder="Ej: Fuerza, CrossFit, Funcional..."
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio (opcional)</Label>
                  <Textarea
                    id="bio"
                    value={registerData.bio}
                    onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                    placeholder="Cuentanos sobre tu experiencia y estilo de entrenamiento..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <Input
                    id="instagram"
                    value={registerData.instagram_handle}
                    onChange={(e) => setRegisterData({ ...registerData, instagram_handle: e.target.value })}
                    placeholder="@tuusuario"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleRegister} disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Registrando...' : 'Completar Registro'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <p className="text-muted-foreground">Gestiona tu perfil y codigo de invitacion</p>
          </div>
          <Badge variant="secondary" className="h-fit">
            <Users className="h-3 w-3 mr-1" />
            {trainer.client_count} / {trainer.max_clients} clientes
          </Badge>
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
                  {trainer.invite_code}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="icon" onClick={copyInviteCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareInviteCode}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Los clientes ingresan este codigo en su app para vincularse
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRegenerateDialog(true)}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerar
            </Button>
          </CardFooter>
        </Card>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Perfil de Trainer
            </CardTitle>
            <CardDescription>
              Actualiza tu informacion profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit_business_name">Nombre del negocio</Label>
                <Input
                  id="edit_business_name"
                  defaultValue={trainer.business_name || ''}
                  onChange={(e) => setUpdateData({ ...updateData, business_name: e.target.value })}
                  placeholder="Nombre de tu marca o negocio"
                />
              </div>
              <div>
                <Label htmlFor="edit_specialty">Especialidad</Label>
                <Input
                  id="edit_specialty"
                  defaultValue={trainer.specialty || ''}
                  onChange={(e) => setUpdateData({ ...updateData, specialty: e.target.value })}
                  placeholder="Ej: Fuerza, CrossFit, Funcional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_bio">Bio</Label>
              <Textarea
                id="edit_bio"
                defaultValue={trainer.bio || ''}
                onChange={(e) => setUpdateData({ ...updateData, bio: e.target.value })}
                placeholder="Describe tu experiencia y metodologia"
                rows={4}
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit_instagram" className="flex items-center gap-1">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="edit_instagram"
                  defaultValue={trainer.instagram_handle || ''}
                  onChange={(e) => setUpdateData({ ...updateData, instagram_handle: e.target.value })}
                  placeholder="@tuusuario"
                />
              </div>
              <div>
                <Label htmlFor="edit_website" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="edit_website"
                  defaultValue={trainer.website || ''}
                  onChange={(e) => setUpdateData({ ...updateData, website: e.target.value })}
                  placeholder="https://tuwebsite.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_max_clients">Limite de clientes</Label>
              <Input
                id="edit_max_clients"
                type="number"
                defaultValue={trainer.max_clients}
                onChange={(e) => setUpdateData({ ...updateData, max_clients: parseInt(e.target.value) })}
                min={1}
                max={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cantidad maxima de clientes que puedes tener vinculados
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending || Object.keys(updateData).length === 0}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>

        {/* Regenerate Dialog */}
        <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerar codigo de invitacion</DialogTitle>
              <DialogDescription>
                Al regenerar el codigo, el codigo anterior dejara de funcionar.
                Los clientes ya vinculados no se veran afectados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegenerate} disabled={regenerateMutation.isPending}>
                {regenerateMutation.isPending ? 'Regenerando...' : 'Regenerar Codigo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TrainerSettings;
